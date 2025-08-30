-- FlightFinder Database Schema
CREATE DATABASE flightfinder_db;
USE flightfinder_db;

-- Users table with encrypted data
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    login_attempts INT DEFAULT 0,
    last_login TIMESTAMP NULL
);

-- Search history table
CREATE TABLE search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    departure_city VARCHAR(100) NOT NULL,
    arrival_city VARCHAR(100) NOT NULL,
    departure_date DATE NOT NULL,
    search_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Booking history table
CREATE TABLE booking_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    flight_number VARCHAR(20),
    airline VARCHAR(100),
    departure_city VARCHAR(100),
    arrival_city VARCHAR(100),
    departure_date DATE,
    booking_site VARCHAR(100),
    price DECIMAL(10,2),
    booking_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin users table
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Site settings table
CREATE TABLE site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, email) VALUES 
('admin', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOuLQv3c1yqBWVHxkd0LQ4YCOuLQv3c1y', 'admin@flightfinder.com');

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value) VALUES 
('site_name', 'FlightFinder'),
('maintenance_mode', 'false'),
('max_login_attempts', '5'),
('session_timeout', '3600');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_booking_history_user_id ON booking_history(user_id);
CREATE INDEX idx_search_timestamp ON search_history(search_timestamp);
CREATE INDEX idx_booking_timestamp ON booking_history(booking_timestamp);
