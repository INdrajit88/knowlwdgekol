#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Symbol,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum TreasuryError {
    NotAuthorized = 1,
    AlreadyInitialized = 2,
    NotInitialized = 3,
    InsufficientEscrow = 4,
    InvalidAmount = 5,
    ContributorNotFound = 6,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    Marketplace,
    ContributorScore(Address),
    EscrowBalance(u64), // Question ID -> Amount
    TotalTreasuryVolume,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ContributorTier {
    Novice,   // < 50 pts
    Bronze,   // 50 - 199 pts
    Silver,   // 200 - 499 pts
    Gold,     // 500 - 999 pts
    Platinum, // 1000+ pts
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContributorProfile {
    pub address: Address,
    pub reputation_points: u32,
    pub total_earned_stroops: i128,
    pub answered_count: u32,
    pub accepted_count: u32,
    pub tier: ContributorTier,
}

#[contract]
pub struct ReputationTreasury;

#[contractimpl]
impl ReputationTreasury {
    /// Initialize the treasury contract with an admin address and market contract address
    pub fn initialize(env: Env, admin: Address, marketplace: Address) -> Result<(), TreasuryError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(TreasuryError::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Marketplace, &marketplace);
        env.storage().instance().set(&DataKey::TotalTreasuryVolume, &0i128);

        env.events().publish(
            (symbol_short!("treasury"), symbol_short!("init")),
            (admin, marketplace),
        );

        Ok(())
    }

    /// Set or update authorized marketplace contract address (Admin only)
    pub fn set_marketplace(env: Env, new_marketplace: Address) -> Result<(), TreasuryError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(TreasuryError::NotInitialized)?;
        admin.require_auth();

        env.storage().instance().set(&DataKey::Marketplace, &new_marketplace);
        Ok(())
    }

    /// Award reputation points to a contributor (Authorized Marketplace contract only)
    pub fn add_reputation(
        env: Env,
        caller: Address,
        contributor: Address,
        points: u32,
        is_accepted_answer: bool,
    ) {
        Self::verify_marketplace(&env, &caller).unwrap();

        let key = DataKey::ContributorScore(contributor.clone());
        let mut profile: ContributorProfile = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(ContributorProfile {
                address: contributor.clone(),
                reputation_points: 0,
                total_earned_stroops: 0,
                answered_count: 0,
                accepted_count: 0,
                tier: ContributorTier::Novice,
            });

        profile.reputation_points += points;
        profile.answered_count += 1;
        if is_accepted_answer {
            profile.accepted_count += 1;
        }

        profile.tier = match profile.reputation_points {
            0..=49 => ContributorTier::Novice,
            50..=199 => ContributorTier::Bronze,
            200..=499 => ContributorTier::Silver,
            500..=999 => ContributorTier::Gold,
            _ => ContributorTier::Platinum,
        };

        env.storage().persistent().set(&key, &profile);

        // Emit reputation event
        env.events().publish(
            (Symbol::new(&env, "reputation_updated"), contributor.clone()),
            (profile.reputation_points, profile.answered_count),
        );
    }

    /// Record escrow deposit for a question bounty (Marketplace call)
    pub fn deposit_escrow(
        env: Env,
        caller: Address,
        question_id: u64,
        amount_stroops: i128,
    ) {
        Self::verify_marketplace(&env, &caller).unwrap();

        if amount_stroops <= 0 {
            panic!("Invalid bounty amount");
        }

        env.storage()
            .persistent()
            .set(&DataKey::EscrowBalance(question_id), &amount_stroops);

        let total_vol: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalTreasuryVolume)
            .unwrap_or(0i128);
        env.storage()
            .instance()
            .set(&DataKey::TotalTreasuryVolume, &(total_vol + amount_stroops));

        env.events().publish(
            (Symbol::new(&env, "escrow_deposited"), question_id),
            amount_stroops,
        );
    }

    /// Release escrowed bounty to answer author (Marketplace call)
    pub fn release_escrow(
        env: Env,
        caller: Address,
        question_id: u64,
        recipient: Address,
    ) -> i128 {
        Self::verify_marketplace(&env, &caller).unwrap();

        let escrow_key = DataKey::EscrowBalance(question_id);
        let amount: i128 = env
            .storage()
            .persistent()
            .get(&escrow_key)
            .expect("Insufficient escrow balance");

        // Remove escrow key once released
        env.storage().persistent().remove(&escrow_key);

        // Update recipient earned totals
        let profile_key = DataKey::ContributorScore(recipient.clone());
        if let Some(mut profile) = env.storage().persistent().get::<DataKey, ContributorProfile>(&profile_key) {
            profile.total_earned_stroops += amount;
            env.storage().persistent().set(&profile_key, &profile);
        }

        env.events().publish(
            (Symbol::new(&env, "escrow_released"), question_id),
            (recipient.clone(), amount),
        );

        amount
    }

    /// Fetch contributor profile
    pub fn get_profile(env: Env, contributor: Address) -> ContributorProfile {
        let key = DataKey::ContributorScore(contributor.clone());
        env.storage().persistent().get(&key).unwrap_or(ContributorProfile {
            address: contributor,
            reputation_points: 0,
            total_earned_stroops: 0,
            answered_count: 0,
            accepted_count: 0,
            tier: ContributorTier::Novice,
        })
    }

    /// Read overall volume processed through treasury
    pub fn get_total_volume(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalTreasuryVolume)
            .unwrap_or(0i128)
    }

    /// Verify calling contract matches registered marketplace
    fn verify_marketplace(env: &Env, caller: &Address) -> Result<(), TreasuryError> {
        let registered: Address = env
            .storage()
            .instance()
            .get(&DataKey::Marketplace)
            .ok_or(TreasuryError::NotInitialized)?;

        if caller != &registered {
            return Err(TreasuryError::NotAuthorized);
        }
        Ok(())
    }
}
