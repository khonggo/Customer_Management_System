CREATE DATABASE IF NOT EXISTS customerDatabase;
USE customerDatabase;

CREATE TABLE customer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ic_number VARCHAR(14) NOT NULL,
    dob DATE NOT NULL,
    address VARCHAR(100),
    address_country ENUM('Malaysia', 'Singapore') NOT NULL,
    address_postcode VARCHAR(20),
    INDEX (ic_number)
);

DELIMITER //
CREATE PROCEDURE GetAllCustomers()
BEGIN
    SELECT * FROM customer;
END //
DELIMITER ;

-- Index Explanation:
-- Index applied for faster search when filtering customers by IC.
