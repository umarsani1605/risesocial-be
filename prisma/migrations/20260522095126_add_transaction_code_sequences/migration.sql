-- Atomic counters for transaction_code generation.
-- New format: <PREFIX><5-digit zero-padded counter>, e.g. RYLS00001, ACAD00001.
-- Sequences start at 1; legacy 14-char codes (RYLS01<hex>, ACAD05<hex>) cannot
-- collide because they have a different length.
CREATE SEQUENCE IF NOT EXISTS ryls_transaction_code_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS academy_transaction_code_seq START WITH 1;
