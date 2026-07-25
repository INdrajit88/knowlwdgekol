#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, BytesN, Env, Symbol, String, Vec,
};

#[cfg(test)]
mod test;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum MarketError {
    NotAuthorized = 1,
    AlreadyInitialized = 2,
    NotInitialized = 3,
    QuestionNotFound = 4,
    AnswerNotFound = 5,
    QuestionAlreadyResolved = 6,
    InvalidBounty = 7,
    ContractPaused = 8,
    SelfVotingNotAllowed = 9,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    TreasuryAddress,
    IsPaused,
    NextQuestionId,
    NextAnswerId,
    Question(u64),
    Answer(u64),
    QuestionAnswers(u64), // Question ID -> Vec<u64> of Answer IDs
    UserVote(u64, Address), // (AnswerID, Voter) -> bool (true = upvoted)
    TotalQuestionsCount,
    TotalAnswersCount,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum QuestionStatus {
    Open,
    Answered,
    Resolved,
    Expired,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Question {
    pub id: u64,
    pub asker: Address,
    pub prompt: String,
    pub category: String,
    pub bounty_stroops: i128,
    pub status: QuestionStatus,
    pub answer_count: u32,
    pub selected_answer_id: Option<u64>,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Answer {
    pub id: u64,
    pub question_id: u64,
    pub author: Address,
    pub teaser: String,
    pub full_content_cid: String,
    pub citations_count: u32,
    pub upvotes: u32,
    pub is_accepted: bool,
    pub created_at: u64,
}

mod treasury_contract {
    use soroban_sdk::{contractclient, Address, Env};

    #[contractclient(name = "Client")]
    pub trait ReputationTreasuryInterface {
        fn add_reputation(
            env: Env,
            caller: Address,
            contributor: Address,
            points: u32,
            is_accepted_answer: bool,
        );
        fn deposit_escrow(
            env: Env,
            caller: Address,
            question_id: u64,
            amount_stroops: i128,
        );
        fn release_escrow(
            env: Env,
            caller: Address,
            question_id: u64,
            recipient: Address,
        ) -> i128;
    }
}

#[contract]
pub struct KnowledgeMarketplace;

#[contractimpl]
impl KnowledgeMarketplace {
    /// Initialize the Marketplace with admin and reputation treasury address
    pub fn initialize(env: Env, admin: Address, treasury: Address) -> Result<(), MarketError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(MarketError::AlreadyInitialized);
        }
        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TreasuryAddress, &treasury);
        env.storage().instance().set(&DataKey::IsPaused, &false);
        env.storage().instance().set(&DataKey::NextQuestionId, &1u64);
        env.storage().instance().set(&DataKey::NextAnswerId, &1u64);
        env.storage().instance().set(&DataKey::TotalQuestionsCount, &0u64);
        env.storage().instance().set(&DataKey::TotalAnswersCount, &0u64);

        env.events().publish(
            (symbol_short!("market"), symbol_short!("init")),
            (admin, treasury),
        );

        Ok(())
    }

    /// Post a new experience request question with a bounty (Inter-contract call to Treasury for escrow)
    pub fn ask_question(
        env: Env,
        asker: Address,
        prompt: String,
        category: String,
        bounty_stroops: i128,
    ) -> Result<u64, MarketError> {
        Self::check_not_paused(&env)?;
        asker.require_auth();

        if bounty_stroops <= 0 {
            return Err(MarketError::InvalidBounty);
        }

        let q_id: u64 = env.storage().instance().get(&DataKey::NextQuestionId).unwrap_or(1);
        let now = env.ledger().timestamp();

        let question = Question {
            id: q_id,
            asker: asker.clone(),
            prompt: prompt.clone(),
            category: category.clone(),
            bounty_stroops,
            status: QuestionStatus::Open,
            answer_count: 0,
            selected_answer_id: None,
            created_at: now,
        };

        // Save Question
        env.storage().persistent().set(&DataKey::Question(q_id), &question);
        env.storage().instance().set(&DataKey::NextQuestionId, &(q_id + 1));
        
        let q_count: u64 = env.storage().instance().get(&DataKey::TotalQuestionsCount).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalQuestionsCount, &(q_count + 1));

        // Inter-contract call to Treasury to record escrow bounty deposit
        let treasury_addr: Address = env.storage().instance().get(&DataKey::TreasuryAddress).unwrap();
        let treasury_client = treasury_contract::Client::new(&env, &treasury_addr);
        treasury_client.deposit_escrow(&env.current_contract_address(), &q_id, &bounty_stroops);

        // Emit Question Created Event
        env.events().publish(
            (Symbol::new(&env, "question_created"), q_id),
            (asker, bounty_stroops, category),
        );

        Ok(q_id)
    }

    /// Submit an expert answer with public teaser preview & locked full content CID
    pub fn submit_answer(
        env: Env,
        author: Address,
        question_id: u64,
        teaser: String,
        full_content_cid: String,
        citations_count: u32,
    ) -> Result<u64, MarketError> {
        Self::check_not_paused(&env)?;
        author.require_auth();

        let q_key = DataKey::Question(question_id);
        let mut question: Question = env
            .storage()
            .persistent()
            .get(&q_key)
            .ok_or(MarketError::QuestionNotFound)?;

        if question.status == QuestionStatus::Resolved {
            return Err(MarketError::QuestionAlreadyResolved);
        }

        let a_id: u64 = env.storage().instance().get(&DataKey::NextAnswerId).unwrap_or(1);
        let now = env.ledger().timestamp();

        let answer = Answer {
            id: a_id,
            question_id,
            author: author.clone(),
            teaser: teaser.clone(),
            full_content_cid: full_content_cid.clone(),
            citations_count,
            upvotes: 0,
            is_accepted: false,
            created_at: now,
        };

        // Save Answer
        env.storage().persistent().set(&DataKey::Answer(a_id), &answer);
        env.storage().instance().set(&DataKey::NextAnswerId, &(a_id + 1));

        // Update Question Answer List & Count
        let answers_key = DataKey::QuestionAnswers(question_id);
        let mut answers_list: Vec<u64> = env
            .storage()
            .persistent()
            .get(&answers_key)
            .unwrap_or(Vec::new(&env));
        answers_list.push_back(a_id);
        env.storage().persistent().set(&answers_key, &answers_list);

        question.answer_count += 1;
        if question.status == QuestionStatus::Open {
            question.status = QuestionStatus::Answered;
        }
        env.storage().persistent().set(&q_key, &question);

        let a_count: u64 = env.storage().instance().get(&DataKey::TotalAnswersCount).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalAnswersCount, &(a_count + 1));

        // Inter-contract call to Treasury to add participation reputation points
        let treasury_addr: Address = env.storage().instance().get(&DataKey::TreasuryAddress).unwrap();
        let treasury_client = treasury_contract::Client::new(&env, &treasury_addr);
        treasury_client.add_reputation(&env.current_contract_address(), &author, &15u32, &false);

        // Emit Answer Submitted Event
        env.events().publish(
            (Symbol::new(&env, "answer_submitted"), question_id),
            (a_id, author, citations_count),
        );

        Ok(a_id)
    }

    /// Upvote an answer teaser
    pub fn upvote_answer(env: Env, voter: Address, answer_id: u64) -> Result<u32, MarketError> {
        Self::check_not_paused(&env)?;
        voter.require_auth();

        let a_key = DataKey::Answer(answer_id);
        let mut answer: Answer = env
            .storage()
            .persistent()
            .get(&a_key)
            .ok_or(MarketError::AnswerNotFound)?;

        if answer.author == voter {
            return Err(MarketError::SelfVotingNotAllowed);
        }

        let vote_key = DataKey::UserVote(answer_id, voter.clone());
        if env.storage().persistent().has(&vote_key) {
            return Ok(answer.upvotes);
        }

        answer.upvotes += 1;
        env.storage().persistent().set(&a_key, &answer);
        env.storage().persistent().set(&vote_key, &true);

        // Emit Upvote Event
        env.events().publish(
            (Symbol::new(&env, "answer_upvoted"), answer_id),
            (voter, answer.upvotes),
        );

        Ok(answer.upvotes)
    }

    /// Select answer & unlock full content (Asker only). Triggers escrow payout to author!
    pub fn accept_answer(env: Env, asker: Address, question_id: u64, answer_id: u64) -> Result<(), MarketError> {
        Self::check_not_paused(&env)?;
        asker.require_auth();

        let q_key = DataKey::Question(question_id);
        let mut question: Question = env
            .storage()
            .persistent()
            .get(&q_key)
            .ok_or(MarketError::QuestionNotFound)?;

        if question.asker != asker {
            return Err(MarketError::NotAuthorized);
        }

        if question.status == QuestionStatus::Resolved {
            return Err(MarketError::QuestionAlreadyResolved);
        }

        let a_key = DataKey::Answer(answer_id);
        let mut answer: Answer = env
            .storage()
            .persistent()
            .get(&a_key)
            .ok_or(MarketError::AnswerNotFound)?;

        // Mark Answer as Accepted & Question as Resolved
        answer.is_accepted = true;
        env.storage().persistent().set(&a_key, &answer);

        question.status = QuestionStatus::Resolved;
        question.selected_answer_id = Some(answer_id);
        env.storage().persistent().set(&q_key, &question);

        // Inter-contract calls to Treasury:
        // 1. Award accepted answer bonus reputation (+50 points)
        // 2. Release escrowed bounty to answer author
        let treasury_addr: Address = env.storage().instance().get(&DataKey::TreasuryAddress).unwrap();
        let treasury_client = treasury_contract::Client::new(&env, &treasury_addr);

        treasury_client.add_reputation(&env.current_contract_address(), &answer.author, &50u32, &true);
        treasury_client.release_escrow(&env.current_contract_address(), &question_id, &answer.author);

        // Emit Resolution Event
        env.events().publish(
            (Symbol::new(&env, "question_resolved"), question_id),
            (answer_id, answer.author, question.bounty_stroops),
        );

        Ok(())
    }

    /// Read Question by ID
    pub fn get_question(env: Env, id: u64) -> Option<Question> {
        env.storage().persistent().get(&DataKey::Question(id))
    }

    /// Read Answer by ID
    pub fn get_answer(env: Env, id: u64) -> Option<Answer> {
        env.storage().persistent().get(&DataKey::Answer(id))
    }

    /// Fetch all Answer IDs for a given Question ID
    pub fn get_question_answers(env: Env, question_id: u64) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::QuestionAnswers(question_id))
            .unwrap_or(Vec::new(&env))
    }

    /// Contract Upgrade Strategy (Admin authorization required)
    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) -> Result<(), MarketError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(MarketError::NotInitialized)?;
        admin.require_auth();

        env.deployer().update_current_contract_wasm(new_wasm_hash.clone());

        env.events().publish(
            (symbol_short!("market"), symbol_short!("upgrade")),
            new_wasm_hash,
        );

        Ok(())
    }

    /// Circuit breaker: Pause contract operations
    pub fn set_paused(env: Env, pause: bool) -> Result<(), MarketError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(MarketError::NotInitialized)?;
        admin.require_auth();

        env.storage().instance().set(&DataKey::IsPaused, &pause);
        Ok(())
    }

    fn check_not_paused(env: &Env) -> Result<(), MarketError> {
        let paused: bool = env.storage().instance().get(&DataKey::IsPaused).unwrap_or(false);
        if paused {
            return Err(MarketError::ContractPaused);
        }
        Ok(())
    }
}
