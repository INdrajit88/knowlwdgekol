#![cfg(test)]

use crate::{KnowledgeMarketplace, KnowledgeMarketplaceClient, QuestionStatus};
use reputation_treasury::{ReputationTreasury, ReputationTreasuryClient};
use soroban_sdk::{
    testutils::Address as _,
    Address, Env, String,
};

#[test]
fn test_successful_qna_and_bounty_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let asker = Address::generate(&env);
    let contributor = Address::generate(&env);

    // Register Treasury Contract
    let treasury_id = env.register_contract(None, ReputationTreasury);
    let treasury_client = ReputationTreasuryClient::new(&env, &treasury_id);

    // Register Marketplace Contract
    let market_id = env.register_contract(None, KnowledgeMarketplace);
    let market_client = KnowledgeMarketplaceClient::new(&env, &market_id);

    // Initialize contracts
    treasury_client.initialize(&admin, &market_id);
    market_client.initialize(&admin, &treasury_id);

    // 1. Asker posts experience question with 50 XLM bounty (500_000_000 stroops)
    let prompt = String::from_str(&env, "How did you scale Soroban smart contract state archival in production?");
    let category = String::from_str(&env, "Architecture");
    let bounty = 500_000_000i128;

    let q_id = market_client.ask_question(&asker, &prompt, &category, &bounty);
    assert_eq!(q_id, 1);

    let question = market_client.get_question(&q_id).unwrap();
    assert_eq!(question.status, QuestionStatus::Open);
    assert_eq!(question.bounty_stroops, bounty);

    // 2. Expert submits answer with teaser & full content CID
    let teaser = String::from_str(&env, "We scaled state archival by implementing automated TTL bump cron jobs and persistent key indexing...");
    let full_cid = String::from_str(&env, "bafybeigdyr3zar5gvb47p5tw5vx2pyn2vpamg5vwstj9k3a");
    let a_id = market_client.submit_answer(&contributor, &q_id, &teaser, &full_cid, &3u32);
    assert_eq!(a_id, 1);

    // Verify contributor gained +15 reputation points for participation
    let profile = treasury_client.get_profile(&contributor);
    assert_eq!(profile.reputation_points, 15);
    assert_eq!(profile.answered_count, 1);

    // 3. Asker accepts answer & unlocks full content
    market_client.accept_answer(&asker, &q_id, &a_id);

    // Verify Question is Resolved & Answer accepted
    let updated_q = market_client.get_question(&q_id).unwrap();
    assert_eq!(updated_q.status, QuestionStatus::Resolved);
    assert_eq!(updated_q.selected_answer_id, Some(a_id));

    let answer = market_client.get_answer(&a_id).unwrap();
    assert!(answer.is_accepted);
    assert_eq!(answer.teaser, teaser);

    // Verify Treasury paid out reputation (+50 bonus) and released escrow
    let updated_profile = treasury_client.get_profile(&contributor);
    assert_eq!(updated_profile.reputation_points, 65);
    assert_eq!(updated_profile.accepted_count, 1);
    assert_eq!(updated_profile.total_earned_stroops, bounty);
}

#[test]
#[should_panic(expected = "HostError")]
fn test_unauthorized_resolution_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let asker = Address::generate(&env);
    let malicious = Address::generate(&env);
    let contributor = Address::generate(&env);

    let treasury_id = env.register_contract(None, ReputationTreasury);
    let treasury_client = ReputationTreasuryClient::new(&env, &treasury_id);
    let market_id = env.register_contract(None, KnowledgeMarketplace);
    let market_client = KnowledgeMarketplaceClient::new(&env, &market_id);

    treasury_client.initialize(&admin, &market_id);
    market_client.initialize(&admin, &treasury_id);

    let prompt = String::from_str(&env, "How do you optimize Soroban CPU instructions?");
    let category = String::from_str(&env, "Performance");
    let bounty = 100_000_000i128;

    let q_id = market_client.ask_question(&asker, &prompt, &category, &bounty);
    let a_id = market_client.submit_answer(
        &contributor,
        &q_id,
        &String::from_str(&env, "Teaser summary"),
        &String::from_str(&env, "cid_123"),
        &2u32,
    );

    // Malicious user tries to resolve asker's question -> Should fail!
    market_client.accept_answer(&malicious, &q_id, &a_id);
}
