-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: hrms_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `activity` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_assignments`
--

DROP TABLE IF EXISTS `asset_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asset_assignments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `asset_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `assigned_by` int(10) unsigned DEFAULT NULL,
  `assigned_date` date NOT NULL,
  `expected_return_date` date DEFAULT NULL,
  `returned_date` date DEFAULT NULL,
  `condition_on_assignment` enum('New','Good','Fair','Damaged') NOT NULL DEFAULT 'Good',
  `condition_on_return` enum('New','Good','Fair','Damaged') DEFAULT NULL,
  `status` enum('Active','Returned') NOT NULL DEFAULT 'Active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `asset_id` (`asset_id`),
  KEY `user_id` (`user_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `asset_assignments_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_assignments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_assignments`
--

LOCK TABLES `asset_assignments` WRITE;
/*!40000 ALTER TABLE `asset_assignments` DISABLE KEYS */;
INSERT INTO `asset_assignments` VALUES (1,1,1,1,'2024-01-16',NULL,NULL,'New',NULL,'Active','Handed over in original box with 140W charger.','2026-09-22 20:53:37','2026-09-22 20:53:37'),(2,2,2,1,'2023-11-21',NULL,NULL,'Good',NULL,'Active','Issued for operations and management.','2026-09-22 20:53:37','2026-09-22 20:53:37'),(3,3,2,1,'2023-12-06',NULL,NULL,'New',NULL,'Active','Mounted on monitor arm at desk 402.','2026-09-22 20:53:37','2026-09-22 20:53:37'),(29,56,36,1,'2024-01-20',NULL,NULL,'Good',NULL,'Active','Standard engineering deployment','2026-09-23 15:21:30','2026-09-23 15:21:30');
/*!40000 ALTER TABLE `asset_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_categories`
--

DROP TABLE IF EXISTS `asset_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asset_categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `code` varchar(20) NOT NULL,
  `icon` varchar(30) DEFAULT 'laptop',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_categories`
--

LOCK TABLES `asset_categories` WRITE;
/*!40000 ALTER TABLE `asset_categories` DISABLE KEYS */;
INSERT INTO `asset_categories` VALUES (1,'Laptops & Desktops','LAPTOP','laptop','MacBooks, Dell, ThinkPads, and workstations','2026-09-22 20:53:37'),(2,'Monitors & Displays','MONITOR','monitor','External 4K displays and workstation screens','2026-09-22 20:53:37'),(3,'Access & Security Keys','SECURITY','key','YubiKeys, physical smart cards, and tokens','2026-09-22 20:53:37'),(4,'Mobile & Tablets','MOBILE','smartphone','Company-issued phones and iPads','2026-09-22 20:53:37'),(5,'Office Peripherals','PERIPHERAL','headphones','Headsets, docks, webcams, and mice','2026-09-22 20:53:37');
/*!40000 ALTER TABLE `asset_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assets` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `asset_tag` varchar(50) NOT NULL,
  `serial_number` varchar(100) NOT NULL,
  `brand` varchar(50) NOT NULL,
  `model` varchar(100) NOT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `warranty_expiry` date DEFAULT NULL,
  `condition` enum('New','Good','Fair','Damaged') NOT NULL DEFAULT 'Good',
  `status` enum('Available','Assigned','Under Repair','Retired') NOT NULL DEFAULT 'Available',
  `current_user_id` int(10) unsigned DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_tag` (`asset_tag`),
  UNIQUE KEY `serial_number` (`serial_number`),
  KEY `category_id` (`category_id`),
  KEY `current_user_id` (`current_user_id`),
  CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `asset_categories` (`id`),
  CONSTRAINT `assets_ibfk_2` FOREIGN KEY (`current_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES (1,1,'MacBook Pro 16\" M3 Max','AST-00101','C02G1234MD6R','Apple','MacBookPro18,1','2024-01-15',3499.00,'USD','2027-01-15','New','Assigned',1,'Assigned to Super Admin for engineering leadership.','2026-09-22 20:53:37','2026-09-22 20:53:37'),(2,1,'Dell XPS 15 9530','AST-00102','8X99K2194B','Dell','XPS 15 9530 i9','2023-11-20',2199.00,'USD','2026-11-20','Good','Assigned',2,'Primary executive management device.','2026-09-22 20:53:37','2026-09-22 20:53:37'),(3,2,'Dell UltraSharp 27\" 4K USB-C','AST-00103','CN098192A01','Dell','U2723QE','2023-12-05',629.00,'USD','2026-12-05','New','Assigned',2,'Workstation secondary display.','2026-09-22 20:53:37','2026-09-22 20:53:37'),(4,3,'YubiKey 5C NFC Security Key','AST-00104','YK948194819','Yubico','YubiKey 5C','2024-02-10',55.00,'USD','2028-02-10','New','Available',NULL,'Stored in IT security safe for next onboarding.','2026-09-22 20:53:37','2026-09-22 20:53:37'),(5,4,'iPad Pro 12.9\" M2','AST-00105','DLXQ9182MD1','Apple','iPad Pro 6th Gen','2023-09-15',1099.00,'USD','2025-09-15','Good','Available',NULL,'Available for executive travel and design testing.','2026-09-22 20:53:37','2026-09-22 20:53:37'),(56,1,'MacBook Pro 16\" - Engineering & Clinical Suite','AST-MBP-0036','C02G31B9449D','Apple','MacBook Pro 16\" M3 Max','2024-01-15',3499.00,'USD',NULL,'Good','Assigned',36,'36GB RAM, 1TB SSD, Space Black','2026-09-23 15:21:30','2026-09-23 15:21:30');
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendances`
--

DROP TABLE IF EXISTS `attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendances` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `date` date NOT NULL,
  `sign_in` time DEFAULT NULL,
  `sign_out` time DEFAULT NULL,
  `stay_time` varchar(30) DEFAULT NULL,
  `status` enum('Present','Late','Absent','Half Day','On Leave') NOT NULL DEFAULT 'Present',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_date_unique` (`user_id`,`date`),
  CONSTRAINT `attendances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendances`
--

LOCK TABLES `attendances` WRITE;
/*!40000 ALTER TABLE `attendances` DISABLE KEYS */;
INSERT INTO `attendances` VALUES (1,1,'2026-09-23','06:00:00','15:30:00','9 hrs 30 mins','Present','Regular shift','2026-09-22 19:42:15','2026-09-22 19:42:15'),(2,2,'2026-09-23','09:00:00','18:00:00','9 hrs 00 mins','Present','Regular shift','2026-09-22 19:42:15','2026-09-22 19:42:15'),(26,36,'2026-09-23','09:00:00','18:00:00','9 hrs 0 mins','Present','Regular shift','2026-09-23 17:38:21','2026-09-23 17:38:21');
/*!40000 ALTER TABLE `attendances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_activity_logs`
--

DROP TABLE IF EXISTS `candidate_activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `candidate_activity_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `candidate_id` int(10) unsigned NOT NULL,
  `from_stage` varchar(50) DEFAULT NULL,
  `to_stage` varchar(50) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `performed_by` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `candidate_id` (`candidate_id`),
  KEY `performed_by` (`performed_by`),
  CONSTRAINT `candidate_activity_logs_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `job_candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `candidate_activity_logs_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_activity_logs`
--

LOCK TABLES `candidate_activity_logs` WRITE;
/*!40000 ALTER TABLE `candidate_activity_logs` DISABLE KEYS */;
INSERT INTO `candidate_activity_logs` VALUES (1,1,NULL,'Applied','Initial application processed in Applied stage',1,'2026-09-23 09:53:19'),(2,2,NULL,'Applied','Initial application processed in Applied stage',1,'2026-09-23 09:53:19'),(3,3,NULL,'Applied','Initial application processed in Applied stage',1,'2026-09-23 09:53:19'),(4,4,NULL,'Screening','Initial application processed in Screening stage',1,'2026-09-23 09:53:19'),(5,5,NULL,'Screening','Initial application processed in Screening stage',1,'2026-09-23 09:53:19'),(6,6,NULL,'Screening','Initial application processed in Screening stage',1,'2026-09-23 09:53:19'),(7,7,NULL,'Interview','Initial application processed in Interview stage',1,'2026-09-23 09:53:19'),(8,8,NULL,'Interview','Initial application processed in Interview stage',1,'2026-09-23 09:53:19'),(9,9,NULL,'Interview','Initial application processed in Interview stage',1,'2026-09-23 09:53:19'),(10,10,NULL,'Offer','Initial application processed in Offer stage',1,'2026-09-23 09:53:19'),(11,11,NULL,'Offer','Initial application processed in Offer stage',1,'2026-09-23 09:53:19'),(12,12,NULL,'Hired','Initial application processed in Hired stage',1,'2026-09-23 09:53:19'),(13,13,NULL,'Hired','Initial application processed in Hired stage',1,'2026-09-23 09:53:19'),(14,14,NULL,'Rejected','Initial application processed in Rejected stage',1,'2026-09-23 09:53:19'),(15,15,NULL,'Rejected','Initial application processed in Rejected stage',1,'2026-09-23 09:53:19'),(91,3,'Applied','Screening','Advanced to Screening',1,'2026-09-23 17:34:43'),(92,1,'Applied','Screening','Advanced to Screening',1,'2026-09-23 17:34:46'),(93,3,'Screening','Interview','Advanced to Interview',1,'2026-09-23 17:34:48'),(94,4,'Screening','Interview','Advanced to Interview',1,'2026-09-23 17:34:51'),(95,4,'Interview','Offer','Advanced to Offer',1,'2026-09-23 17:34:54'),(96,4,'Offer','Hired','Offer accepted! Candidate officially hired.',1,'2026-09-23 17:34:56'),(97,4,'Hired','Screening','Candidate advanced to Screening',1,'2026-09-23 17:36:52'),(98,4,'Screening','Hired','Candidate advanced to Hired',1,'2026-09-23 17:36:54');
/*!40000 ALTER TABLE `candidate_activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_holidays`
--

DROP TABLE IF EXISTS `company_holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `company_holidays` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `holiday_date` date NOT NULL,
  `day_name` varchar(20) NOT NULL,
  `type` enum('Statutory','Optional','Observance') NOT NULL DEFAULT 'Statutory',
  `is_mandatory_off` tinyint(1) NOT NULL DEFAULT 1,
  `description` varchar(255) DEFAULT NULL,
  `year` int(10) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_holiday_date_name` (`holiday_date`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_holidays`
--

LOCK TABLES `company_holidays` WRITE;
/*!40000 ALTER TABLE `company_holidays` DISABLE KEYS */;
INSERT INTO `company_holidays` VALUES (1,'New Year\'s Day','2026-01-01','Thursday','Statutory',1,'Federal & global public holiday celebrating the new year',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(2,'Martin Luther King Jr. Day','2026-01-19','Monday','Statutory',1,'Honoring civil rights leader Dr. Martin Luther King Jr.',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(3,'Presidents\' Day','2026-02-16','Monday','Statutory',1,'Washington\'s Birthday & honoring US presidents',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(4,'Memorial Day','2026-05-25','Monday','Statutory',1,'Honoring fallen military personnel and unofficial start of summer',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(5,'Juneteenth National Independence Day','2026-06-19','Friday','Statutory',1,'Commemorating the emancipation of enslaved African Americans',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(6,'Independence Day (Observed)','2026-07-03','Friday','Statutory',1,'Celebration of the Declaration of Independence (Observed)',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(7,'Labor Day','2026-09-07','Monday','Statutory',1,'National celebration of the American labor movement',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(8,'Indigenous Peoples\' Day / Columbus Day','2026-10-12','Monday','Optional',0,'Floating cultural observance and federal holiday',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(9,'Veterans Day','2026-11-11','Wednesday','Optional',0,'Tribute to all military veterans who served in the armed forces',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(10,'Thanksgiving Day','2026-11-26','Thursday','Statutory',1,'National harvest festival and thanksgiving holiday',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(11,'Day After Thanksgiving / Black Friday','2026-11-27','Friday','Observance',1,'Extended holiday weekend for company staff and families',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(12,'Christmas Eve','2026-12-24','Thursday','Observance',1,'Half-day / company winter holiday observance',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(13,'Christmas Day','2026-12-25','Friday','Statutory',1,'Official global statutory holiday celebrating Christmas',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17'),(14,'New Year\'s Eve (Optional Half-Day)','2026-12-31','Thursday','Optional',0,'Year-end wrap up and celebratory floating holiday',2026,'2026-09-23 08:53:17','2026-09-23 08:53:17');
/*!40000 ALTER TABLE `company_holidays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_salary_structures`
--

DROP TABLE IF EXISTS `employee_salary_structures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employee_salary_structures` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `employment_type` enum('Permanent','Temporary','Intern') NOT NULL DEFAULT 'Permanent',
  `base_salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `effective_date` date NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `routing_code` varchar(50) DEFAULT NULL,
  `payment_method` enum('Bank Transfer','Cheque','Cash') NOT NULL DEFAULT 'Bank Transfer',
  `components_override` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`components_override`)),
  `status` enum('Active','Archived') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `employee_salary_structures_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_salary_structures`
--

LOCK TABLES `employee_salary_structures` WRITE;
/*!40000 ALTER TABLE `employee_salary_structures` DISABLE KEYS */;
INSERT INTO `employee_salary_structures` VALUES (1,1,'Permanent',4000.00,'USD','2026-01-01','Bank of America','9876543210','ACH-111000','Bank Transfer',NULL,'Active','2026-09-23 07:10:09','2026-09-23 07:13:51'),(2,2,'Intern',850.00,'USD','2026-01-01','Wells Fargo','555444333','ACH-222000','Bank Transfer',NULL,'Active','2026-09-23 07:10:09','2026-09-23 07:13:51'),(3,36,'Permanent',53806.41,'USD','2026-09-23',NULL,NULL,NULL,'Bank Transfer',NULL,'Active','2026-09-23 16:43:40','2026-09-23 17:57:30');
/*!40000 ALTER TABLE `employee_salary_structures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_claims`
--

DROP TABLE IF EXISTS `expense_claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expense_claims` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `claim_number` varchar(50) NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` enum('Travel & Mileage','Meals & Entertainment','Equipment & Tech','Internet & Utilities','Medical & Health','Training & Certs','Other') NOT NULL DEFAULT 'Other',
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `claim_date` date NOT NULL,
  `receipt_url` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected','Reimbursed') NOT NULL DEFAULT 'Pending',
  `approver_id` int(10) unsigned DEFAULT NULL,
  `approver_remarks` text DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `reimbursed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `claim_number` (`claim_number`),
  KEY `idx_claim_user` (`user_id`),
  KEY `idx_claim_status` (`status`),
  KEY `idx_claim_approver` (`approver_id`),
  CONSTRAINT `expense_claims_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `expense_claims_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_claims`
--

LOCK TABLES `expense_claims` WRITE;
/*!40000 ALTER TABLE `expense_claims` DISABLE KEYS */;
INSERT INTO `expense_claims` VALUES (1,'CLM-2026-001',36,'Clinical Research & Pharmacology Journal Subscription','Training & Certs',180.00,'USD','2026-09-18',NULL,'Annual IEEE & Medical Pharmacology database access for clinical documentation updates.','Pending',NULL,NULL,NULL,NULL,'2026-09-23 15:21:30','2026-09-23 15:21:30'),(2,'CLM-2026-002',36,'Client On-Site Pharmacy Audit Travel','Travel & Mileage',64.50,'USD','2026-09-21',NULL,'Metro pass and rideshare reimbursement for offsite facility inspection.','Pending',NULL,NULL,NULL,NULL,'2026-09-23 15:21:30','2026-09-23 15:21:30'),(3,'CLM-2026-003',1,'Enterprise Cloud Hosting & SSL Certificates','Equipment & Tech',349.00,'USD','2026-09-08',NULL,'Annual wildcard SSL renewal and high-availability server cluster bandwidth overage.','Approved',2,'Approved per Q3 IT Infrastructure budget.','2026-09-23 11:51:30',NULL,'2026-09-23 15:21:30','2026-09-23 15:21:30'),(4,'CLM-2026-2848F',36,'High-Speed Fiber Internet & Regional Clinic Travel','Internet & Utilities',85.50,'USD','2026-09-23','/uploads/receipts/test_bill.pdf','Work from home connectivity and off-site client travel','Pending',NULL,NULL,NULL,NULL,'2026-09-23 15:24:18','2026-09-23 15:24:18');
/*!40000 ALTER TABLE `expense_claims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `helpdesk_categories`
--

DROP TABLE IF EXISTS `helpdesk_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `helpdesk_categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `icon` varchar(50) NOT NULL DEFAULT 'HelpCircle',
  `color` varchar(30) NOT NULL DEFAULT '#10b981',
  `sla_urgent_hrs` int(10) unsigned NOT NULL DEFAULT 4,
  `sla_high_hrs` int(10) unsigned NOT NULL DEFAULT 12,
  `sla_medium_hrs` int(10) unsigned NOT NULL DEFAULT 24,
  `sla_low_hrs` int(10) unsigned NOT NULL DEFAULT 48,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `helpdesk_categories`
--

LOCK TABLES `helpdesk_categories` WRITE;
/*!40000 ALTER TABLE `helpdesk_categories` DISABLE KEYS */;
INSERT INTO `helpdesk_categories` VALUES (1,'Payroll & Tax Withholding','PAYROLL','Salary computation errors, tax exemptions, bonus queries and payslip corrections.','DollarSign','#10b981',4,12,24,48,1,'2026-09-23 17:41:57','2026-09-23 17:41:57'),(2,'IT & Hardware Infrastructure','IT-SUPPORT','Laptop issues, VPN setup, peripheral requests, access permissions and email configuration.','Laptop','#3b82f6',2,8,24,48,1,'2026-09-23 17:41:57','2026-09-23 17:41:57'),(3,'HR Policies & Employee Benefits','HR-POLICY','Leave carryover policy, medical insurance enrollment, maternity/paternity guidelines.','Briefcase','#8b5cf6',6,18,36,72,1,'2026-09-23 17:41:57','2026-09-23 17:41:57'),(4,'Workplace Grievance & Ethics','GRIEVANCE','Strictly confidential escalation for harassment, ethical misconduct or workplace disputes.','ShieldAlert','#ef4444',4,12,24,48,1,'2026-09-23 17:41:57','2026-09-23 17:41:57'),(5,'Facilities & Office Admin','FACILITIES','Desk allocation, ID card replacement, visitor passes, cafeteria and parking queries.','Building2','#f59e0b',8,24,48,96,1,'2026-09-23 17:41:57','2026-09-23 17:41:57');
/*!40000 ALTER TABLE `helpdesk_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `helpdesk_messages`
--

DROP TABLE IF EXISTS `helpdesk_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `helpdesk_messages` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ticket_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `message` text NOT NULL,
  `is_internal_note` tinyint(1) NOT NULL DEFAULT 0,
  `attachment_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_msg_ticket` (`ticket_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `helpdesk_messages_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `helpdesk_tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `helpdesk_messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `helpdesk_messages`
--

LOCK TABLES `helpdesk_messages` WRITE;
/*!40000 ALTER TABLE `helpdesk_messages` DISABLE KEYS */;
INSERT INTO `helpdesk_messages` VALUES (1,1,1,'Submitted declaration copy and bank statement for reference.',0,NULL,'2026-09-23 14:12:19'),(2,1,1,'Auditing tax ledger with Finance Department. Component adjustment prepared.',1,NULL,'2026-09-23 14:12:19'),(3,1,1,'Hello! We have reviewed your 80C submission and identified the missing receipt. It will be credited back in your next pay run.',0,NULL,'2026-09-23 14:12:19'),(4,3,1,'Thank you for reaching out in confidence. Could you please share the physician recommendation letter so we can calibrate with Clinical Shift Planning?',0,NULL,'2026-09-23 14:12:19'),(5,5,1,'HDMI port flickering intermittently during team meetings.',0,NULL,'2026-09-23 17:47:50'),(6,6,1,'Discreet inquiry regarding workplace atmosphere.',0,NULL,'2026-09-23 17:47:50'),(7,7,1,'Main issue description.',0,NULL,'2026-09-23 17:47:50'),(8,7,1,'Here is the screenshot and additional details.',0,NULL,'2026-09-23 17:47:50'),(9,7,2,'Internal HR: Checked IT asset warranty, covered until Dec 2026.',1,NULL,'2026-09-23 17:47:50'),(10,8,1,'Testing status changes.',0,NULL,'2026-09-23 17:47:50'),(11,9,1,'Testing agent assignment.',0,NULL,'2026-09-23 17:47:50'),(12,10,1,'Checking CSAT feedback submission.',0,NULL,'2026-09-23 17:47:50'),(13,11,1,'HDMI port flickering intermittently during team meetings.',0,NULL,'2026-09-23 17:48:13'),(14,12,1,'Discreet inquiry regarding workplace atmosphere.',0,NULL,'2026-09-23 17:48:13'),(15,13,1,'Main issue description.',0,NULL,'2026-09-23 17:48:13'),(16,13,1,'Here is the screenshot and additional details.',0,NULL,'2026-09-23 17:48:13'),(17,13,2,'Internal HR: Checked IT asset warranty, covered until Dec 2026.',1,NULL,'2026-09-23 17:48:13'),(18,14,1,'Testing status changes.',0,NULL,'2026-09-23 17:48:13'),(19,15,1,'Testing agent assignment.',0,NULL,'2026-09-23 17:48:13'),(20,16,1,'Checking CSAT feedback submission.',0,NULL,'2026-09-23 17:48:13'),(21,17,1,'HDMI port flickering intermittently during team meetings.',0,NULL,'2026-09-23 17:51:53'),(22,18,1,'Discreet inquiry regarding workplace atmosphere.',0,NULL,'2026-09-23 17:51:53'),(23,19,1,'Main issue description.',0,NULL,'2026-09-23 17:51:53'),(24,19,1,'Here is the screenshot and additional details.',0,NULL,'2026-09-23 17:51:53'),(25,19,2,'Internal HR: Checked IT asset warranty, covered until Dec 2026.',1,NULL,'2026-09-23 17:51:53'),(26,20,1,'Testing status changes.',0,NULL,'2026-09-23 17:51:53'),(27,21,1,'Testing agent assignment.',0,NULL,'2026-09-23 17:51:53'),(28,22,1,'Checking CSAT feedback submission.',0,NULL,'2026-09-23 17:51:53'),(29,23,1,'HDMI port flickering intermittently during team meetings.',0,NULL,'2026-09-23 17:57:40'),(30,24,1,'Discreet inquiry regarding workplace atmosphere.',0,NULL,'2026-09-23 17:57:40'),(31,25,1,'Main issue description.',0,NULL,'2026-09-23 17:57:40'),(32,25,1,'Here is the screenshot and additional details.',0,NULL,'2026-09-23 17:57:40'),(33,25,2,'Internal HR: Checked IT asset warranty, covered until Dec 2026.',1,NULL,'2026-09-23 17:57:40'),(34,26,1,'Testing status changes.',0,NULL,'2026-09-23 17:57:40'),(35,27,1,'Testing agent assignment.',0,NULL,'2026-09-23 17:57:40'),(36,28,1,'Checking CSAT feedback submission.',0,NULL,'2026-09-23 17:57:40');
/*!40000 ALTER TABLE `helpdesk_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `helpdesk_tickets`
--

DROP TABLE IF EXISTS `helpdesk_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `helpdesk_tickets` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ticket_number` varchar(50) NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  `priority` enum('Low','Medium','High','Urgent') NOT NULL DEFAULT 'Medium',
  `status` enum('Open','In Progress','Waiting on Employee','Resolved','Closed') NOT NULL DEFAULT 'Open',
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `assigned_to` int(10) unsigned DEFAULT NULL,
  `is_confidential` tinyint(1) NOT NULL DEFAULT 0,
  `sla_due_at` datetime NOT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `csat_rating` tinyint(3) unsigned DEFAULT NULL,
  `csat_feedback` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  KEY `idx_ticket_status` (`status`),
  KEY `idx_ticket_priority` (`priority`),
  KEY `idx_ticket_user` (`user_id`),
  KEY `idx_ticket_assigned` (`assigned_to`),
  KEY `idx_ticket_confidential` (`is_confidential`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `helpdesk_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `helpdesk_tickets_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `helpdesk_categories` (`id`),
  CONSTRAINT `helpdesk_tickets_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `helpdesk_tickets`
--

LOCK TABLES `helpdesk_tickets` WRITE;
/*!40000 ALTER TABLE `helpdesk_tickets` DISABLE KEYS */;
INSERT INTO `helpdesk_tickets` VALUES (1,'TKT-2026-0001',1,1,'Urgent','In Progress','Discrepancy in August Monthly Payslip TDS Deduction','My payslip shows an extra $240 TDS deduction compared to the submitted 80C declaration. Kindly review and adjust in the September disbursement cycle.',1,0,'2026-09-23 23:42:19',NULL,NULL,NULL,NULL,'2026-09-23 14:12:19','2026-09-23 17:42:19'),(2,'TKT-2026-0002',2,2,'High','Open','MacBook USB-C Multiport Dock Power Failure','The issued Dell Thunderbolt dock is no longer charging the laptop or recognizing external display monitors.',NULL,0,'2026-09-24 07:42:19',NULL,NULL,NULL,NULL,'2026-09-23 14:12:19','2026-09-23 17:42:19'),(3,'TKT-2026-0003',1,4,'High','Waiting on Employee','Confidential Inquiry Regarding Team Shift Reassignment','Reporting unfair night roster allocations occurring repeatedly over the past 2 months despite medical exemption submission.',1,1,'2026-09-24 19:42:19',NULL,NULL,NULL,NULL,'2026-09-23 14:12:19','2026-09-23 17:42:19'),(4,'TKT-2026-0004',2,5,'Low','Closed','Building Access Badge RFID Reprogramming','Smart card scanner is not opening the 3rd floor pharmacy research wing door.',1,0,'2026-09-21 19:42:19','2026-09-22 19:42:19','2026-09-22 19:42:19',5,'Super prompt assistance by office security desk! Fixed in 15 minutes.','2026-09-21 14:12:19','2026-09-23 17:42:19'),(5,'TKT-2026-0005',1,2,'High','Open','TEST: Second Monitor Display Cable Flickering','HDMI port flickering intermittently during team meetings.',NULL,0,'2026-09-24 03:47:50',NULL,NULL,NULL,NULL,'2026-09-23 17:47:50','2026-09-23 17:47:50'),(6,'TKT-2026-0006',1,4,'Urgent','Open','TEST: Strictly Confidential Inquiry','Discreet inquiry regarding workplace atmosphere.',NULL,1,'2026-09-23 23:47:50',NULL,NULL,NULL,NULL,'2026-09-23 17:47:50','2026-09-23 17:47:50'),(7,'TKT-2026-0007',1,5,'Medium','Open','TEST: Thread Communication Ticket','Main issue description.',NULL,0,'2026-09-25 19:47:50',NULL,NULL,NULL,NULL,'2026-09-23 17:47:50','2026-09-23 17:47:50'),(8,'TKT-2026-0008',1,5,'Low','Closed','TEST: Workflow Lifecycle Ticket','Testing status changes.',NULL,0,'2026-09-27 19:47:50','2026-09-23 23:17:50','2026-09-23 23:17:50',NULL,NULL,'2026-09-23 17:47:50','2026-09-23 17:47:50'),(9,'TKT-2026-0009',1,5,'Medium','In Progress','TEST: Assignment Verification','Testing agent assignment.',2,0,'2026-09-25 19:47:50',NULL,NULL,NULL,NULL,'2026-09-23 17:47:50','2026-09-23 17:47:50'),(10,'TKT-2026-0010',1,5,'Low','Closed','TEST: CSAT Rating Test','Checking CSAT feedback submission.',NULL,0,'2026-09-27 19:47:50','2026-09-23 23:17:50','2026-09-23 23:17:50',5,'Super fast response and issue was resolved within 2 hours!','2026-09-23 17:47:50','2026-09-23 17:47:50'),(11,'TKT-2026-0011',1,2,'High','Open','TEST: Second Monitor Display Cable Flickering','HDMI port flickering intermittently during team meetings.',NULL,0,'2026-09-24 03:48:13',NULL,NULL,NULL,NULL,'2026-09-23 17:48:13','2026-09-23 17:48:13'),(12,'TKT-2026-0012',1,4,'Urgent','Open','TEST: Strictly Confidential Inquiry','Discreet inquiry regarding workplace atmosphere.',NULL,1,'2026-09-23 23:48:13',NULL,NULL,NULL,NULL,'2026-09-23 17:48:13','2026-09-23 17:48:13'),(13,'TKT-2026-0013',1,5,'Medium','Open','TEST: Thread Communication Ticket','Main issue description.',NULL,0,'2026-09-25 19:48:13',NULL,NULL,NULL,NULL,'2026-09-23 17:48:13','2026-09-23 17:48:13'),(14,'TKT-2026-0014',1,5,'Low','Closed','TEST: Workflow Lifecycle Ticket','Testing status changes.',NULL,0,'2026-09-27 19:48:13','2026-09-23 23:18:13','2026-09-23 23:18:13',NULL,NULL,'2026-09-23 17:48:13','2026-09-23 17:48:13'),(15,'TKT-2026-0015',1,5,'Medium','In Progress','TEST: Assignment Verification','Testing agent assignment.',2,0,'2026-09-25 19:48:13',NULL,NULL,NULL,NULL,'2026-09-23 17:48:13','2026-09-23 17:48:13'),(16,'TKT-2026-0016',1,5,'Low','Closed','TEST: CSAT Rating Test','Checking CSAT feedback submission.',NULL,0,'2026-09-27 19:48:13','2026-09-23 23:18:13','2026-09-23 23:18:13',5,'Super fast response and issue was resolved within 2 hours!','2026-09-23 17:48:13','2026-09-23 17:48:13'),(17,'TKT-2026-0017',1,2,'High','Open','TEST: Second Monitor Display Cable Flickering','HDMI port flickering intermittently during team meetings.',NULL,0,'2026-09-24 03:51:53',NULL,NULL,NULL,NULL,'2026-09-23 17:51:53','2026-09-23 17:51:53'),(18,'TKT-2026-0018',1,4,'Urgent','Open','TEST: Strictly Confidential Inquiry','Discreet inquiry regarding workplace atmosphere.',NULL,1,'2026-09-23 23:51:53',NULL,NULL,NULL,NULL,'2026-09-23 17:51:53','2026-09-23 17:51:53'),(19,'TKT-2026-0019',1,5,'Medium','Open','TEST: Thread Communication Ticket','Main issue description.',NULL,0,'2026-09-25 19:51:53',NULL,NULL,NULL,NULL,'2026-09-23 17:51:53','2026-09-23 17:51:53'),(20,'TKT-2026-0020',1,5,'Low','Closed','TEST: Workflow Lifecycle Ticket','Testing status changes.',NULL,0,'2026-09-27 19:51:53','2026-09-23 23:21:53','2026-09-23 23:21:53',NULL,NULL,'2026-09-23 17:51:53','2026-09-23 17:51:53'),(21,'TKT-2026-0021',1,5,'Medium','In Progress','TEST: Assignment Verification','Testing agent assignment.',2,0,'2026-09-25 19:51:53',NULL,NULL,NULL,NULL,'2026-09-23 17:51:53','2026-09-23 17:51:53'),(22,'TKT-2026-0022',1,5,'Low','Closed','TEST: CSAT Rating Test','Checking CSAT feedback submission.',NULL,0,'2026-09-27 19:51:53','2026-09-23 23:21:53','2026-09-23 23:21:53',5,'Super fast response and issue was resolved within 2 hours!','2026-09-23 17:51:53','2026-09-23 17:51:53'),(23,'TKT-2026-0023',1,2,'High','Open','TEST: Second Monitor Display Cable Flickering','HDMI port flickering intermittently during team meetings.',NULL,0,'2026-09-24 03:57:40',NULL,NULL,NULL,NULL,'2026-09-23 17:57:40','2026-09-23 17:57:40'),(24,'TKT-2026-0024',1,4,'Urgent','Open','TEST: Strictly Confidential Inquiry','Discreet inquiry regarding workplace atmosphere.',NULL,1,'2026-09-23 23:57:40',NULL,NULL,NULL,NULL,'2026-09-23 17:57:40','2026-09-23 17:57:40'),(25,'TKT-2026-0025',1,5,'Medium','Open','TEST: Thread Communication Ticket','Main issue description.',NULL,0,'2026-09-25 19:57:40',NULL,NULL,NULL,NULL,'2026-09-23 17:57:40','2026-09-23 17:57:40'),(26,'TKT-2026-0026',1,5,'Low','Closed','TEST: Workflow Lifecycle Ticket','Testing status changes.',NULL,0,'2026-09-27 19:57:40','2026-09-23 23:27:40','2026-09-23 23:27:40',NULL,NULL,'2026-09-23 17:57:40','2026-09-23 17:57:40'),(27,'TKT-2026-0027',1,5,'Medium','In Progress','TEST: Assignment Verification','Testing agent assignment.',2,0,'2026-09-25 19:57:40',NULL,NULL,NULL,NULL,'2026-09-23 17:57:40','2026-09-23 17:57:40'),(28,'TKT-2026-0028',1,5,'Low','Closed','TEST: CSAT Rating Test','Checking CSAT feedback submission.',NULL,0,'2026-09-27 19:57:40','2026-09-23 23:27:40','2026-09-23 23:27:40',5,'Super fast response and issue was resolved within 2 hours!','2026-09-23 17:57:40','2026-09-23 17:57:40');
/*!40000 ALTER TABLE `helpdesk_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_candidates`
--

DROP TABLE IF EXISTS `job_candidates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_candidates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `job_id` int(10) unsigned NOT NULL,
  `candidate_code` varchar(50) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `current_company` varchar(150) DEFAULT NULL,
  `experience_years` decimal(4,1) NOT NULL DEFAULT 0.0,
  `expected_salary` decimal(12,2) DEFAULT NULL,
  `source` enum('LinkedIn','Career Page','Referral','Indeed','Agency','Other') NOT NULL DEFAULT 'LinkedIn',
  `stage` enum('Applied','Screening','Interview','Offer','Hired','Rejected') NOT NULL DEFAULT 'Applied',
  `rating` tinyint(3) unsigned NOT NULL DEFAULT 3,
  `resume_url` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `applied_at` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `candidate_code` (`candidate_code`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `job_candidates_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `job_openings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_candidates`
--

LOCK TABLES `job_candidates` WRITE;
/*!40000 ALTER TABLE `job_candidates` DISABLE KEYS */;
INSERT INTO `job_candidates` VALUES (1,1,'APP-1001','Marcus Vance','marcus.vance@example.com','+1 (555) 234-5678','Apex Cloud Inc.',5.5,5200.00,'LinkedIn','Screening',4,NULL,'Strong background in full stack React + MySQL architecture.','2026-09-18','2026-09-23 09:53:19','2026-09-23 17:34:46'),(2,1,'APP-1002','Elena Rostova','elena.rostova@example.com','+1 (555) 345-6789','FinTech Labs',4.0,4800.00,'Career Page','Applied',3,NULL,'Solid API design background, reviewed initial portfolio.','2026-09-20','2026-09-23 09:53:19','2026-09-23 09:53:19'),(3,2,'APP-1003','Dr. Julian Morales','julian.morales@example.com','+1 (555) 456-7890','CityCare Health',6.0,3900.00,'Indeed','Interview',5,NULL,'PharmD holder with comprehensive clinical inventory experience.','2026-09-21','2026-09-23 09:53:19','2026-09-23 17:34:48'),(4,1,'APP-1004','Siddharth Patel','sid.patel@example.com','+1 (555) 567-8901','ByteForge Soft',7.0,5800.00,'Referral','Hired',5,NULL,'Screening call completed by HR. Strong communication and tech stack match.','2026-09-15','2026-09-23 09:53:19','2026-09-23 17:36:54'),(5,4,'APP-1005','Chloe Dubois','chloe.dubois@example.com','+1 (555) 678-9012','Studio Pixel',3.5,3600.00,'LinkedIn','Screening',4,NULL,'Impressive design system portfolio in Figma.','2026-09-16','2026-09-23 09:53:19','2026-09-23 09:53:19'),(6,3,'APP-1006','Hannah Scott','hannah.scott@example.com','+1 (555) 789-0123','TalentHub Solutions',4.5,3400.00,'LinkedIn','Screening',4,NULL,'Experienced with compliance filings and payroll onboarding.','2026-09-14','2026-09-23 09:53:19','2026-09-23 09:53:19'),(7,1,'APP-1007','David Kim','david.kim@example.com','+1 (555) 890-1234','NextGen Digital',6.5,5500.00,'LinkedIn','Interview',5,NULL,'Technical interview scheduled for Thursday 2:00 PM. Completed take-home test with 95% score.','2026-09-10','2026-09-23 09:53:19','2026-09-23 09:53:19'),(8,2,'APP-1008','Fatima Al-Mansoor','fatima.almansoor@example.com','+1 (555) 901-2345','Al-Amal Medical Center',4.0,3800.00,'Agency','Interview',4,NULL,'Panel interview scheduled with Chief Pharmacist on Friday.','2026-09-12','2026-09-23 09:53:19','2026-09-23 09:53:19'),(9,4,'APP-1009','Oliver Wright','oliver.wright@example.com','+1 (555) 012-3456','Kreativ Lab',5.0,3900.00,'Referral','Interview',4,NULL,'Live design challenge review completed. Positive feedback from Product Lead.','2026-09-11','2026-09-23 09:53:19','2026-09-23 09:53:19'),(10,1,'APP-1010','Aisha Rahman','aisha.rahman@example.com','+1 (555) 123-9876','Synapse Corp',6.0,5400.00,'LinkedIn','Offer',5,NULL,'Offer letter extended at $5,400/mo. Candidate reviewing benefits package.','2026-09-05','2026-09-23 09:53:19','2026-09-23 09:53:19'),(11,2,'APP-1011','Lucas Bernard','lucas.bernard@example.com','+1 (555) 234-8765','PharmaPlus Clinic',5.0,4000.00,'Career Page','Offer',5,NULL,'Written offer sent. Acceptance expected by end of week.','2026-09-08','2026-09-23 09:53:19','2026-09-23 09:53:19'),(12,1,'APP-1012','Alexander Hayes','alex.hayes@example.com','+1 (555) 345-7654','CloudScale Ltd.',8.0,5800.00,'LinkedIn','Hired',5,NULL,'Offer accepted. Joining date set for October 1, 2026. Onboarding initiated.','2026-09-01','2026-09-23 09:53:19','2026-09-23 09:53:19'),(13,3,'APP-1013','Grace Lin','grace.lin@example.com','+1 (555) 456-6543','Metro Health Systems',5.0,3600.00,'Referral','Hired',5,NULL,'Contract signed. Laptop and badge provisioned in IT Asset system.','2026-08-28','2026-09-23 09:53:19','2026-09-23 09:53:19'),(14,1,'APP-1014','Dmitri Volkov','dmitri.volkov@example.com','+1 (555) 567-5432','Freelance',2.0,4500.00,'Indeed','Rejected',2,NULL,'Insufficient experience in enterprise backend scaling and concurrency.','2026-09-02','2026-09-23 09:53:19','2026-09-23 09:53:19'),(15,4,'APP-1015','Zoe Martin','zoe.martin@example.com','+1 (555) 678-4321','AdMedia Works',1.5,3200.00,'Career Page','Rejected',2,NULL,'Skills focused more on graphic marketing rather than software product UX.','2026-09-04','2026-09-23 09:53:19','2026-09-23 09:53:19');
/*!40000 ALTER TABLE `job_candidates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_openings`
--

DROP TABLE IF EXISTS `job_openings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_openings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `job_code` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `department` varchar(100) NOT NULL,
  `location` enum('Remote','On-site','Hybrid') NOT NULL DEFAULT 'Hybrid',
  `employment_type` enum('Full-time','Part-time','Contract','Internship') NOT NULL DEFAULT 'Full-time',
  `experience_level` enum('Entry','Mid','Senior','Lead') NOT NULL DEFAULT 'Mid',
  `salary_min` decimal(12,2) DEFAULT NULL,
  `salary_max` decimal(12,2) DEFAULT NULL,
  `positions_count` int(10) unsigned NOT NULL DEFAULT 1,
  `status` enum('Draft','Published','Closed','Archived') NOT NULL DEFAULT 'Published',
  `description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `hiring_manager_id` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `job_code` (`job_code`),
  KEY `hiring_manager_id` (`hiring_manager_id`),
  CONSTRAINT `job_openings_ibfk_1` FOREIGN KEY (`hiring_manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_openings`
--

LOCK TABLES `job_openings` WRITE;
/*!40000 ALTER TABLE `job_openings` DISABLE KEYS */;
INSERT INTO `job_openings` VALUES (1,'JOB-2026-001','Senior Full Stack Engineer','Engineering','Hybrid','Full-time','Senior',4500.00,6000.00,2,'Published','We are seeking an experienced Full Stack Engineer to lead architectural design and development of enterprise HRMS and payroll services.','5+ years experience with React, PHP/Node.js, relational databases, REST APIs, and high-performance caching.',1,'2026-09-23 09:53:19','2026-09-23 09:53:19'),(2,'JOB-2026-002','Clinical Pharmacy Specialist','Pharmacy Operations','On-site','Full-time','Mid',3200.00,4200.00,3,'Published','Manage prescription dispensing protocols, therapeutic patient consultations, and regulatory pharmaceutical compliance.','Licensed Pharmacist with minimum 3 years clinical or community healthcare experience.',1,'2026-09-23 09:53:19','2026-09-23 09:53:19'),(3,'JOB-2026-003','HR Operations & Talent Specialist','Human Resources','Hybrid','Full-time','Mid',2800.00,3800.00,1,'Published','Drive recruitment, onboarding experiences, statutory compliance registers, and employee engagement programs.','Proven background in HR generalist duties, labor laws, payroll coordination, and talent acquisition.',1,'2026-09-23 09:53:19','2026-09-23 09:53:19'),(4,'JOB-2026-004','Product UI/UX Designer','Product Design','Remote','Full-time','Mid',3000.00,4000.00,1,'Published','Design user-centric interfaces, design systems, micro-interactions, and workflows for cloud enterprise applications.','Proficiency in Figma, design tokens, responsive web layout principles, and user research workflows.',1,'2026-09-23 09:53:19','2026-09-23 09:53:19'),(5,'JOB-2026-005','Financial Accountant & Auditor','Finance & Accounting','On-site','Full-time','Senior',3500.00,4800.00,1,'Published','Oversee general ledgers, tax TDS filings, financial year-end audits, and statutory payroll disbursements.','CPA / ACCA or equivalent degree with 4+ years corporate accounting and taxation experience.',1,'2026-09-23 09:53:19','2026-09-23 09:53:19'),(6,'JOB-2026-006','Pharmaceutical Sales Associate','Sales & Business','On-site','Full-time','Entry',1800.00,2500.00,4,'Published','Engage healthcare clinics, handle point-of-sale customer interactions, and maintain product inventory merchandising.','Energetic communication skills with background in retail or healthcare customer service.',1,'2026-09-23 09:53:19','2026-09-23 09:53:19');
/*!40000 ALTER TABLE `job_openings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_balances`
--

DROP TABLE IF EXISTS `leave_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leave_balances` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `leave_type_id` int(10) unsigned NOT NULL,
  `year` int(10) unsigned NOT NULL,
  `total_days` decimal(4,1) NOT NULL DEFAULT 0.0,
  `used_days` decimal(4,1) NOT NULL DEFAULT 0.0,
  `pending_days` decimal(4,1) NOT NULL DEFAULT 0.0,
  `remaining_days` decimal(4,1) NOT NULL DEFAULT 0.0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_type_year` (`user_id`,`leave_type_id`,`year`),
  KEY `leave_type_id` (`leave_type_id`),
  CONSTRAINT `leave_balances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_balances_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=916 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_balances`
--

LOCK TABLES `leave_balances` WRITE;
/*!40000 ALTER TABLE `leave_balances` DISABLE KEYS */;
INSERT INTO `leave_balances` VALUES (1,1,1,2026,12.0,1.0,5.0,6.0,'2026-09-23 17:57:30'),(2,1,2,2026,10.0,0.0,0.0,10.0,'2026-09-22 20:20:35'),(3,1,3,2026,15.0,0.0,0.0,15.0,'2026-09-22 20:20:35'),(4,1,4,2026,90.0,0.0,0.0,90.0,'2026-09-22 20:20:35'),(5,1,5,2026,30.0,0.0,0.0,30.0,'2026-09-22 20:20:35'),(6,2,1,2026,12.0,3.0,0.0,9.0,'2026-09-22 20:39:47'),(7,2,2,2026,10.0,2.0,0.0,8.0,'2026-09-22 20:20:35'),(8,2,3,2026,15.0,0.0,0.0,15.0,'2026-09-22 20:20:35'),(9,2,4,2026,90.0,0.0,0.0,90.0,'2026-09-22 20:20:35'),(10,2,5,2026,30.0,0.0,0.0,30.0,'2026-09-22 20:20:35'),(551,36,1,2026,12.0,42.0,2.0,18.0,'2026-09-23 17:57:30'),(552,36,2,2026,10.0,0.0,0.0,10.0,'2026-09-23 15:21:06'),(553,36,3,2026,15.0,0.0,0.0,15.0,'2026-09-23 15:21:06'),(554,36,4,2026,90.0,0.0,0.0,90.0,'2026-09-23 15:21:06'),(555,36,5,2026,30.0,0.0,0.0,30.0,'2026-09-23 15:21:06');
/*!40000 ALTER TABLE `leave_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leave_requests` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `leave_type_id` int(10) unsigned NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` decimal(4,1) NOT NULL DEFAULT 1.0,
  `is_half_day` tinyint(1) NOT NULL DEFAULT 0,
  `reason` text NOT NULL,
  `status` enum('Pending','Approved','Rejected','Cancelled') NOT NULL DEFAULT 'Pending',
  `approver_id` int(10) unsigned DEFAULT NULL,
  `approver_remarks` text DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `leave_type_id` (`leave_type_id`),
  KEY `approver_id` (`approver_id`),
  CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_requests_ibfk_3` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES (1,2,1,'2026-09-25','2026-09-27',3.0,0,'Family wedding out of town','Approved',1,'Approved by manager','2026-09-22 20:39:47','2026-09-22 20:20:35','2026-09-22 20:39:47'),(2,2,2,'2026-09-13','2026-09-14',2.0,0,'Seasonal viral flu','Approved',NULL,NULL,NULL,'2026-09-11 18:30:00','2026-09-22 20:20:35'),(3,1,1,'2026-10-22','2026-10-22',1.0,0,'Test leave application','Pending',NULL,NULL,NULL,'2026-09-22 20:23:02','2026-09-22 20:23:02'),(5,1,1,'2026-10-01','2026-10-02',2.0,0,'Medical checkup and dental treatment','Pending',NULL,NULL,NULL,'2026-09-22 20:40:20','2026-09-22 20:40:20'),(6,1,1,'2026-10-01','2026-10-02',2.0,0,'Medical checkup and dental treatment','Pending',NULL,NULL,NULL,'2026-09-22 20:40:43','2026-09-22 20:40:43'),(34,36,1,'2026-09-26','2026-09-28',3.0,0,'Attending Annual Healthcare Practitioners Conference and clinical pharmacology training.','Pending',NULL,NULL,NULL,'2026-09-23 15:21:30','2026-09-23 15:21:30'),(36,36,1,'2026-11-10','2026-11-12',2.0,0,'Family celebration and clinical conference travel','Approved',2,'Approved per manager schedule review.','2026-09-23 15:23:42','2026-09-23 15:23:42','2026-09-23 15:23:42');
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_types`
--

DROP TABLE IF EXISTS `leave_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leave_types` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `code` varchar(10) NOT NULL,
  `days_allowed_per_year` int(10) unsigned NOT NULL DEFAULT 12,
  `is_paid` tinyint(1) NOT NULL DEFAULT 1,
  `color` varchar(20) DEFAULT 'emerald',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_types`
--

LOCK TABLES `leave_types` WRITE;
/*!40000 ALTER TABLE `leave_types` DISABLE KEYS */;
INSERT INTO `leave_types` VALUES (1,'Casual Leave','CL',12,1,'emerald','Personal affairs, unplanned short-term absences','2026-09-22 20:20:35'),(2,'Sick Leave','SL',10,1,'amber','Medical emergencies, illness and doctor visits','2026-09-22 20:20:35'),(3,'Paid Annual Leave','PL',15,1,'blue','Planned vacation and annual paid holidays','2026-09-22 20:20:35'),(4,'Maternity / Paternity','ML',90,1,'purple','Parental leave for childcare and new additions','2026-09-22 20:20:35'),(5,'Unpaid Leave','LOP',30,0,'slate','Loss of pay absence beyond allotted quotas','2026-09-22 20:20:35');
/*!40000 ALTER TABLE `leave_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lifecycle_tasks`
--

DROP TABLE IF EXISTS `lifecycle_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lifecycle_tasks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `workflow_id` int(10) unsigned NOT NULL,
  `title` varchar(150) NOT NULL,
  `department` enum('HR','IT','Finance','Operations','Department Head') NOT NULL,
  `assigned_to` int(10) unsigned DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed','Waived') NOT NULL DEFAULT 'Pending',
  `due_date` date DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `completed_by` int(10) unsigned DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `workflow_id` (`workflow_id`),
  CONSTRAINT `lifecycle_tasks_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `lifecycle_workflows` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=255 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lifecycle_tasks`
--

LOCK TABLES `lifecycle_tasks` WRITE;
/*!40000 ALTER TABLE `lifecycle_tasks` DISABLE KEYS */;
INSERT INTO `lifecycle_tasks` VALUES (1,1,'Sign NDA & Employee Code of Conduct','HR',NULL,'Completed','2026-09-30','2026-09-21 12:53:22',NULL,'Digitally signed via DocuSign',1,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(2,1,'Submit Identity & Address Proofs for Background Check','HR',NULL,'Completed','2026-09-30','2026-09-21 12:53:22',NULL,'Passport and SSN verified',2,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(3,1,'Provision MacBook Pro & IT Security Token','IT',NULL,'Completed','2026-09-30','2026-09-21 12:53:22',NULL,'MacBook M3 Pro assigned (AST-LAP-001)',3,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(4,1,'Create Google Workspace & Slack Accounts','IT',NULL,'Completed','2026-09-30','2026-09-21 12:53:22',NULL,'SSO credentials activated',4,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(5,1,'Setup Payroll & Direct Deposit Bank Details','Finance',NULL,'Completed','2026-09-30','2026-09-21 12:53:22',NULL,'Routing and account verified',5,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(6,1,'Team Welcome Lunch & Culture Orientation','HR',NULL,'In Progress','2026-09-30',NULL,NULL,'Scheduled for Monday at 12:30 PM',6,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(7,1,'Assign Onboarding Mentor / Buddy Sync','Department Head',NULL,'Pending','2026-09-30',NULL,NULL,'Senior engineer assigned for first 30 days',7,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(8,1,'30-Day New Hire Review & Goal Setting','Department Head',NULL,'Pending','2026-09-30',NULL,NULL,'Review OKRs and milestones',8,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(9,2,'Resignation Acceptance & Notice Period Agreement','HR',NULL,'Completed','2026-10-09','2026-09-18 12:53:22',NULL,'Formal notice accepted by management',1,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(10,2,'Project Knowledge Transfer & Code Handover','Department Head',NULL,'Completed','2026-10-09','2026-09-18 12:53:22',NULL,'Architecture documentation completed in Notion',2,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(11,2,'Return IT Hardware (Laptop, Monitor, Security Key)','IT',NULL,'Pending','2026-10-09',NULL,NULL,'Due on last working day',3,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(12,2,'Revoke Email, Slack, GitHub, & VPN Access','IT',NULL,'Pending','2026-10-09',NULL,NULL,'Scheduled for deactivation on LWD 6:00 PM',4,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(13,2,'Audit Company Credit Card & Expense Receipts','Finance',NULL,'Completed','2026-10-09','2026-09-18 12:53:22',NULL,'Zero outstanding balance',5,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(14,2,'Calculate Final Settlement (Leave Encashment & Gratuity)','Finance',NULL,'Pending','2026-10-09',NULL,NULL,'Awaiting IT clearance for final disbursal sign-off',6,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(15,2,'Conduct Formal HR Exit Interview Survey','HR',NULL,'Completed','2026-10-09','2026-09-18 12:53:22',NULL,'Exit survey feedback logged',7,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(16,2,'Issue Relieving Letter & Service Experience Certificate','HR',NULL,'Pending','2026-10-09',NULL,NULL,'Generated upon final clearance approval',8,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(17,3,'Sign NDA & Security Documentation','HR',NULL,'Completed','2026-08-24','2026-09-17 12:53:22',NULL,NULL,1,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(18,3,'Hardware & Peripheral Issuance','IT',NULL,'Completed','2026-08-24','2026-09-17 12:53:22',NULL,NULL,2,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(19,3,'Bank Account Verification & Tax Setup','Finance',NULL,'Completed','2026-08-24','2026-09-17 12:53:22',NULL,NULL,3,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(20,3,'30-Day Check-in & Manager Sign-off','Department Head',NULL,'Completed','2026-08-24','2026-09-17 12:53:22',NULL,NULL,4,'2026-09-23 10:53:22','2026-09-23 10:53:22');
/*!40000 ALTER TABLE `lifecycle_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lifecycle_workflows`
--

DROP TABLE IF EXISTS `lifecycle_workflows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lifecycle_workflows` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `workflow_code` varchar(50) NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `type` enum('Onboarding','Offboarding') NOT NULL,
  `title` varchar(150) NOT NULL,
  `status` enum('Draft','In Progress','Completed','Cancelled','On Hold') NOT NULL DEFAULT 'In Progress',
  `progress_percent` int(10) unsigned NOT NULL DEFAULT 0,
  `target_date` date NOT NULL,
  `resignation_date` date DEFAULT NULL,
  `notice_period_days` int(11) NOT NULL DEFAULT 30,
  `reason` varchar(255) DEFAULT NULL,
  `exit_interview_notes` text DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `workflow_code` (`workflow_code`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `lifecycle_workflows_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lifecycle_workflows`
--

LOCK TABLES `lifecycle_workflows` WRITE;
/*!40000 ALTER TABLE `lifecycle_workflows` DISABLE KEYS */;
INSERT INTO `lifecycle_workflows` VALUES (1,'ONB-2026-001',2,'Onboarding','New Hire Onboarding ΓÇö Emma Walker','In Progress',62,'2026-09-30',NULL,30,NULL,NULL,1,NULL,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(2,'OFF-2026-001',2,'Offboarding','Resignation & Exit Clearance ΓÇö Emma Walker','In Progress',50,'2026-10-09','2026-09-09',30,'Pursuing Higher Education & Relocation','Positive feedback regarding team engineering culture and mentorship.',1,NULL,'2026-09-23 10:53:22','2026-09-23 10:53:22'),(3,'ONB-2026-002',1,'Onboarding','Product Operations Onboarding ΓÇö Abu Bin Ishtiyak','Completed',100,'2026-08-24',NULL,30,NULL,NULL,1,'2026-09-18 12:53:22','2026-09-23 10:53:22','2026-09-23 10:53:22');
/*!40000 ALTER TABLE `lifecycle_workflows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_logs`
--

DROP TABLE IF EXISTS `notification_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `recipient_phone` varchar(30) NOT NULL,
  `recipient_name` varchar(100) DEFAULT NULL,
  `channel` enum('whatsapp','sms') NOT NULL DEFAULT 'whatsapp',
  `event_type` enum('leave_approval','salary_disbursal','onboarding_welcome','attendance_alert','custom_broadcast') NOT NULL,
  `template_name` varchar(100) DEFAULT NULL,
  `message_text` text NOT NULL,
  `message_id` varchar(120) DEFAULT NULL,
  `status` enum('queued','sent','delivered','read','failed') NOT NULL DEFAULT 'sent',
  `raw_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_payload`)),
  `api_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`api_response`)),
  `error_message` varchar(255) DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `message_id` (`message_id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_status` (`status`),
  KEY `idx_channel` (`channel`),
  KEY `idx_recipient_phone` (`recipient_phone`),
  KEY `idx_message_id` (`message_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notification_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_logs`
--

LOCK TABLES `notification_logs` WRITE;
/*!40000 ALTER TABLE `notification_logs` DISABLE KEYS */;
INSERT INTO `notification_logs` VALUES (1,1,'+917021889883','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-09-25 to 2026-09-26 (2 days) has been Approved by Emma Walker.\n\nRemarks: Approved enjoy your leave\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSOTVEQzFCRjczODg1RjlCNkMyAA==','read',NULL,NULL,NULL,'2026-09-23 16:58:16','2026-09-23 17:03:16','2026-09-23 17:08:16','2026-09-23 16:58:16','2026-09-23 16:58:16'),(2,2,'+919820011223','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for August 2026 of Γé╣85,000 has been disbursed via Bank Transfer (Ref: TXN-20260831-9842).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.HBgMOTE5ODIwMDExMjIzFQIAERgSRTYyMDU0RjE3MDcwODQyNTU2AA==','delivered',NULL,NULL,NULL,'2026-09-23 13:58:16','2026-09-23 14:08:16',NULL,'2026-09-23 16:58:16','2026-09-23 16:58:16'),(3,36,'+919920334455','Dr. Julian Morales','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Dr. Julian Morales! ≡ƒÄë We are thrilled to have you join our team as Lead Pharmacist.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE5OTIwMzM0NDU1FQIAERgSNDgyMTIwNTY4RDIwNjkwMkRGAA==','read',NULL,NULL,NULL,'2026-09-22 18:58:16','2026-09-22 19:00:16','2026-09-22 19:13:16','2026-09-23 16:58:16','2026-09-23 16:58:16'),(4,1,'+917021889883','Abu Bin Ishtiyak','sms','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, we noticed you have not clocked in as of 10:15 AM on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','sms_89410482_acme','delivered',NULL,NULL,NULL,'2026-09-23 18:28:16','2026-09-23 18:30:16',NULL,'2026-09-23 16:58:16','2026-09-23 16:58:16'),(5,2,'+919820011223','Emma Walker','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Emma Walker, missing checkout warning detected for today 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE5ODIwMDExMjIzFQIAERgSODc2NzI2OUU1RENFMzM1OUE4AA==','sent',NULL,NULL,NULL,'2026-09-23 18:53:16',NULL,NULL,'2026-09-23 16:58:16','2026-09-23 16:58:16'),(6,NULL,'917021889883','Abu Bin Ishtiyak','whatsapp','custom_broadcast',NULL,'Hello! Test WhatsApp notification from Acme Global HRMS.','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMzA2N0NFMzc1RTQyQjk3QTlBAA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Hello! Test WhatsApp notification from Acme Global HRMS.\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMzA2N0NFMzc1RTQyQjk3QTlBAA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:01:35','2026-09-23 19:02:09','2026-09-23 19:02:24','2026-09-23 17:01:37','2026-09-23 17:02:24'),(7,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRDBDNjYzNzlEMjdCQTc1QkQ1AA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRDBDNjYzNzlEMjdCQTc1QkQ1AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:03:57',NULL,NULL,'2026-09-23 17:03:58','2026-09-23 17:03:58'),(8,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 ( days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSRjgyODBDNjlDNDJDRDUzMzFBAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 ( days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSRjgyODBDNjlDNDJDRDUzMzFBAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:03:58',NULL,NULL,'2026-09-23 17:03:59','2026-09-23 17:03:59'),(9,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December  of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDA2N2Y5OWVmOQ==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December  of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:03:59',NULL,NULL,'2026-09-23 17:03:59','2026-09-23 17:03:59'),(10,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNDY5NTNGOEFBRkY1RkRBMzVGAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNDY5NTNGOEFBRkY1RkRBMzVGAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:03:59',NULL,NULL,'2026-09-23 17:04:00','2026-09-23 17:04:00'),(11,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNUQ1OTVCNTVFRDAyMzUwQTM3AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNUQ1OTVCNTVFRDAyMzUwQTM3AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:04:00',NULL,NULL,'2026-09-23 17:04:01','2026-09-23 17:04:01'),(12,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSN0Y0NTIxNTE1N0E0OUY5NjVBAA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSN0Y0NTIxNTE1N0E0OUY5NjVBAA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:04:01','2026-09-23 19:04:02','2026-09-23 19:04:02','2026-09-23 17:04:02','2026-09-23 17:04:02'),(13,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQ0Y5NUZBQjM5MDBCNkUxM0NFAA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQ0Y5NUZBQjM5MDBCNkUxM0NFAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:05:25',NULL,NULL,'2026-09-23 17:05:26','2026-09-23 17:05:26'),(14,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNEExREZBQTI0QTQwNzJCQTdGAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNEExREZBQTI0QTQwNzJCQTdGAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:05:26',NULL,NULL,'2026-09-23 17:05:27','2026-09-23 17:05:27'),(15,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDA2ZDcxZGE2Mg==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:05:27',NULL,NULL,'2026-09-23 17:05:27','2026-09-23 17:05:27'),(16,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNDdEQ0U2NzMzRkM5MDRFRUIwAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNDdEQ0U2NzMzRkM5MDRFRUIwAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:05:27',NULL,NULL,'2026-09-23 17:05:28','2026-09-23 17:05:28'),(17,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQjlDNUE1QkZBOTIyOUQ3REI5AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQjlDNUE1QkZBOTIyOUQ3REI5AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:05:28',NULL,NULL,'2026-09-23 17:05:29','2026-09-23 17:05:29'),(18,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMzJBMEI0NzcxOUEzODlGNzA2AA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMzJBMEI0NzcxOUEzODlGNzA2AA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:05:29','2026-09-23 19:05:29','2026-09-23 19:05:29','2026-09-23 17:05:29','2026-09-23 17:05:29'),(19,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRjEyRjMyRkVEQUQwNzAxNDA0AA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRjEyRjMyRkVEQUQwNzAxNDA0AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:08:32',NULL,NULL,'2026-09-23 17:08:34','2026-09-23 17:08:34'),(20,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSOTVEQ0Y2NTY1NkFBNzE1RkE3AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSOTVEQ0Y2NTY1NkFBNzE1RkE3AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:08:34',NULL,NULL,'2026-09-23 17:08:35','2026-09-23 17:08:35'),(21,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDA3OTM0NDBjOQ==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:08:35',NULL,NULL,'2026-09-23 17:08:35','2026-09-23 17:08:35'),(22,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQjJFRDcwRDMzNjk1QUU2MzUwAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQjJFRDcwRDMzNjk1QUU2MzUwAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:08:35',NULL,NULL,'2026-09-23 17:08:36','2026-09-23 17:08:36'),(23,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMEY1RkVGMDMzOTA1NjdGQUVDAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMEY1RkVGMDMzOTA1NjdGQUVDAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:08:36',NULL,NULL,'2026-09-23 17:08:37','2026-09-23 17:08:37'),(24,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSN0VENzBFNUIyQTkzNkE5MzREAA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSN0VENzBFNUIyQTkzNkE5MzREAA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:08:37','2026-09-23 19:08:38','2026-09-23 19:08:38','2026-09-23 17:08:38','2026-09-23 17:08:38'),(25,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSNzNDMDkwRTIyODMzMDRENjFBAA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSNzNDMDkwRTIyODMzMDRENjFBAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:13:02',NULL,NULL,'2026-09-23 17:13:03','2026-09-23 17:13:03'),(26,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSODBDQ0Q0RTcwRDI2NDQ4OTkzAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSODBDQ0Q0RTcwRDI2NDQ4OTkzAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:13:03',NULL,NULL,'2026-09-23 17:13:04','2026-09-23 17:13:04'),(27,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDA4YTBhYzQzMg==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:13:04',NULL,NULL,'2026-09-23 17:13:04','2026-09-23 17:13:04'),(28,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMkZBQjFBM0Y3ODNBQ0NDNjA2AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMkZBQjFBM0Y3ODNBQ0NDNjA2AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:13:04',NULL,NULL,'2026-09-23 17:13:05','2026-09-23 17:13:05'),(29,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQjI5MzMxNzExNkE1NzJDRkJBAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQjI5MzMxNzExNkE1NzJDRkJBAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:13:05',NULL,NULL,'2026-09-23 17:13:06','2026-09-23 17:13:06'),(30,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQjI4RTBBQTNCQUJDRDY5RTZGAA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQjI4RTBBQTNCQUJDRDY5RTZGAA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:13:06','2026-09-23 19:13:07','2026-09-23 19:13:07','2026-09-23 17:13:07','2026-09-23 17:13:07'),(31,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSN0VFMThERDM0MTlERDg2MjhEAA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSN0VFMThERDM0MTlERDg2MjhEAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:13:32',NULL,NULL,'2026-09-23 17:13:33','2026-09-23 17:13:33'),(32,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSN0YzRkY5Njg4QTZFODBBNTdBAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSN0YzRkY5Njg4QTZFODBBNTdBAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:13:33',NULL,NULL,'2026-09-23 17:13:34','2026-09-23 17:13:34'),(33,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDA4YmU3NDY2OA==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:13:34',NULL,NULL,'2026-09-23 17:13:34','2026-09-23 17:13:34'),(34,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSRjA4QkFFMDY0MUU5NDU2RjAyAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSRjA4QkFFMDY0MUU5NDU2RjAyAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:13:34',NULL,NULL,'2026-09-23 17:13:35','2026-09-23 17:13:35'),(35,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSOUQxN0RGODU5RjVEN0MyQzUxAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSOUQxN0RGODU5RjVEN0MyQzUxAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:13:35',NULL,NULL,'2026-09-23 17:13:36','2026-09-23 17:13:36'),(36,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQjFCNEY1RjRERDc1RjMyNEYzAA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQjFCNEY1RjRERDc1RjMyNEYzAA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:13:36','2026-09-23 19:13:37','2026-09-23 19:13:37','2026-09-23 17:13:37','2026-09-23 17:13:37'),(37,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQUY0MjJBN0VCNkM2ODQ1OUEyAA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQUY0MjJBN0VCNkM2ODQ1OUEyAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:14:07',NULL,NULL,'2026-09-23 17:14:08','2026-09-23 17:14:08'),(38,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSRjU2ODU0NDdCNDQ2M0FDMzhEAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSRjU2ODU0NDdCNDQ2M0FDMzhEAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:14:08',NULL,NULL,'2026-09-23 17:14:09','2026-09-23 17:14:09'),(39,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDA4ZTE2ZjlkZA==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:14:09',NULL,NULL,'2026-09-23 17:14:09','2026-09-23 17:14:09'),(40,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMzRBNkRDMDczOTc5OThEQjhBAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMzRBNkRDMDczOTc5OThEQjhBAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:14:09',NULL,NULL,'2026-09-23 17:14:10','2026-09-23 17:14:10'),(41,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQTQzMjI3MEI4Mjg5OEE3QkRFAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQTQzMjI3MEI4Mjg5OEE3QkRFAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:14:10',NULL,NULL,'2026-09-23 17:14:11','2026-09-23 17:14:11'),(42,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMjkwMEJGMTFBNjdBMUExNjAyAA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMjkwMEJGMTFBNjdBMUExNjAyAA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:14:11','2026-09-23 19:14:12','2026-09-23 19:14:12','2026-09-23 17:14:12','2026-09-23 17:14:12'),(43,36,'+917021889883','Dr. Julian Morales','whatsapp','custom_broadcast',NULL,'Welcome to Acme Global, Dr. Julian Morales! ≡ƒÄë We are thrilled to have you join our team as Lead Pharmacist.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQ0IzMDk4OTQ3NTFFMDlBNDA5AA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Welcome to Acme Global, Dr. Julian Morales! \\ud83c\\udf89 We are thrilled to have you join our team as Lead Pharmacist.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQ0IzMDk4OTQ3NTFFMDlBNDA5AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:15:41',NULL,NULL,'2026-09-23 17:15:43','2026-09-23 17:15:43'),(44,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRkU5NDZBOUJDOTYwQzRBNzY5AA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRkU5NDZBOUJDOTYwQzRBNzY5AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:16:49',NULL,NULL,'2026-09-23 17:16:50','2026-09-23 17:16:50'),(45,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMjYzMzBEOTg1MTA3RDVFNTY1AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMjYzMzBEOTg1MTA3RDVFNTY1AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:16:50',NULL,NULL,'2026-09-23 17:16:51','2026-09-23 17:16:51'),(46,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDA5ODM5YjAxZQ==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:16:51',NULL,NULL,'2026-09-23 17:16:51','2026-09-23 17:16:51'),(47,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQkRCNzhFODQ4MkVGQzAzMkVFAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQkRCNzhFODQ4MkVGQzAzMkVFAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:16:51',NULL,NULL,'2026-09-23 17:16:52','2026-09-23 17:16:52'),(48,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSRjcyOEM3Mjc3MzFGQjk4ODBBAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSRjcyOEM3Mjc3MzFGQjk4ODBBAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:16:52',NULL,NULL,'2026-09-23 17:16:53','2026-09-23 17:16:53'),(49,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMzY0RTFCNEY3MEMyOTMxOUVCAA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMzY0RTFCNEY3MEMyOTMxOUVCAA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:16:53','2026-09-23 19:16:54','2026-09-23 19:16:54','2026-09-23 17:16:54','2026-09-23 17:16:54'),(50,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQjFDMDU3NThGNEU3MTBDQkI2AA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQjFDMDU3NThGNEU3MTBDQkI2AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:22:57',NULL,NULL,'2026-09-23 17:22:59','2026-09-23 17:22:59'),(51,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNjQwMDIxN0UxRkZBMzlCQTIxAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNjQwMDIxN0UxRkZBMzlCQTIxAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:22:59',NULL,NULL,'2026-09-23 17:23:00','2026-09-23 17:23:00'),(52,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDBhZjQ1NDEyMA==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:23:00',NULL,NULL,'2026-09-23 17:23:00','2026-09-23 17:23:00'),(53,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNjgxQ0NDQjhCQkYwODRBMzY0AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNjgxQ0NDQjhCQkYwODRBMzY0AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:23:00',NULL,NULL,'2026-09-23 17:23:01','2026-09-23 17:23:01'),(54,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMzEwRDBFNkFBQkNFOEIyMjY5AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMzEwRDBFNkFBQkNFOEIyMjY5AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:23:01',NULL,NULL,'2026-09-23 17:23:02','2026-09-23 17:23:02'),(55,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQjYyQ0RBRkVDOUI3NTgxOTM5AA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQjYyQ0RBRkVDOUI3NTgxOTM5AA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:23:02','2026-09-23 19:23:03','2026-09-23 19:23:03','2026-09-23 17:23:03','2026-09-23 17:23:03'),(56,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSOEIzRjUyMDJBMjNCMDZBRTJCAA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSOEIzRjUyMDJBMjNCMDZBRTJCAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:34:40',NULL,NULL,'2026-09-23 17:34:42','2026-09-23 17:34:42'),(57,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMjM0NTIwRDVFMkRDNTE3MkNCAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMjM0NTIwRDVFMkRDNTE3MkNCAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:34:42',NULL,NULL,'2026-09-23 17:34:43','2026-09-23 17:34:43'),(58,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDBkYjNiN2U3MQ==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:34:43',NULL,NULL,'2026-09-23 17:34:43','2026-09-23 17:34:43'),(59,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSOEQ2MjY0NUFDQTJFMDc5M0VCAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSOEQ2MjY0NUFDQTJFMDc5M0VCAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:34:43',NULL,NULL,'2026-09-23 17:34:44','2026-09-23 17:34:44'),(60,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNDBDMkU0QkQ3ODJEMzU0NTc3AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNDBDMkU0QkQ3ODJEMzU0NTc3AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:34:44',NULL,NULL,'2026-09-23 17:34:45','2026-09-23 17:34:45'),(61,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRDNGRDRCMDMyRTVDQjZCNTcwAA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRDNGRDRCMDMyRTVDQjZCNTcwAA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:34:45','2026-09-23 19:34:46','2026-09-23 19:34:46','2026-09-23 17:34:46','2026-09-23 17:34:46'),(62,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMTM5RUM3RjEzNUYzNTdDMTg5AA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMTM5RUM3RjEzNUYzNTdDMTg5AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:46:16',NULL,NULL,'2026-09-23 17:46:18','2026-09-23 17:46:18'),(63,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMTE1MTVFRkREODU3OEZGOUQ3AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMTE1MTVFRkREODU3OEZGOUQ3AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:46:18',NULL,NULL,'2026-09-23 17:46:19','2026-09-23 17:46:19'),(64,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDEwNmJlMDljYg==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:46:19',NULL,NULL,'2026-09-23 17:46:19','2026-09-23 17:46:19'),(65,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNjI0MTRBNDA3RDVBMEExRTRCAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNjI0MTRBNDA3RDVBMEExRTRCAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:46:20',NULL,NULL,'2026-09-23 17:46:21','2026-09-23 17:46:21'),(66,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQTQyNjc2QUQzRjhDRkNCNDU4AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQTQyNjc2QUQzRjhDRkNCNDU4AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:46:21',NULL,NULL,'2026-09-23 17:46:22','2026-09-23 17:46:22'),(67,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRENFRjQ2MTc1QzNFOUQyOTZFAA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRENFRjQ2MTc1QzNFOUQyOTZFAA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:46:22','2026-09-23 19:46:23','2026-09-23 19:46:23','2026-09-23 17:46:23','2026-09-23 17:46:23'),(68,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMzE3NENGMjBENzRGNkNBREYzAA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMzE3NENGMjBENzRGNkNBREYzAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:47:14',NULL,NULL,'2026-09-23 17:47:15','2026-09-23 17:47:15'),(69,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNTEyM0MwRTFCMDVEODY1MzA3AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNTEyM0MwRTFCMDVEODY1MzA3AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:47:15',NULL,NULL,'2026-09-23 17:47:16','2026-09-23 17:47:16'),(70,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDEwYTRjMzQxMQ==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:47:16',NULL,NULL,'2026-09-23 17:47:17','2026-09-23 17:47:17'),(71,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQTZCQzlFQkY2QzdCRTg0NTEyAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQTZCQzlFQkY2QzdCRTg0NTEyAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:47:17',NULL,NULL,'2026-09-23 17:47:18','2026-09-23 17:47:18'),(72,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNUQzOUNCMEJCN0VFNjc3QjdGAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNUQzOUNCMEJCN0VFNjc3QjdGAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:47:18',NULL,NULL,'2026-09-23 17:47:19','2026-09-23 17:47:19'),(73,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSNjAyQTM3NjYzQzQ1RTlCNUZDAA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSNjAyQTM3NjYzQzQ1RTlCNUZDAA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:47:19','2026-09-23 19:47:20','2026-09-23 19:47:20','2026-09-23 17:47:20','2026-09-23 17:47:20'),(74,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQzk5MUIzNURFRjc4MzNFM0M3AA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQzk5MUIzNURFRjc4MzNFM0M3AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:47:44',NULL,NULL,'2026-09-23 17:47:45','2026-09-23 17:47:45'),(75,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQ0I5NzMxNjU5MDZEMzgwRkQ3AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQ0I5NzMxNjU5MDZEMzgwRkQ3AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:47:45',NULL,NULL,'2026-09-23 17:47:46','2026-09-23 17:47:46'),(76,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDEwYzI5MGE0NA==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:47:46',NULL,NULL,'2026-09-23 17:47:47','2026-09-23 17:47:47'),(77,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSOTIyMkFCMUNCRjAyQjI1QTUwAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSOTIyMkFCMUNCRjAyQjI1QTUwAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:47:47',NULL,NULL,'2026-09-23 17:47:48','2026-09-23 17:47:48'),(78,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQjc0M0Q3NTU2QUVFMjZBOTQyAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQjc0M0Q3NTU2QUVFMjZBOTQyAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:47:48',NULL,NULL,'2026-09-23 17:47:49','2026-09-23 17:47:49'),(79,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMjg5Q0E5MzdBMjM0M0JDRDk1AA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSMjg5Q0E5MzdBMjM0M0JDRDk1AA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:47:49','2026-09-23 19:47:50','2026-09-23 19:47:50','2026-09-23 17:47:50','2026-09-23 17:47:50'),(80,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSOUNENjZDODUzQUUxNEY2MTA0AA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSOUNENjZDODUzQUUxNEY2MTA0AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:48:07',NULL,NULL,'2026-09-23 17:48:08','2026-09-23 17:48:08'),(81,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMzk3NkVBMkVCRkFEQTdGOUJBAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMzk3NkVBMkVCRkFEQTdGOUJBAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:48:08',NULL,NULL,'2026-09-23 17:48:10','2026-09-23 17:48:10'),(82,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDEwZGEzMzE1OA==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:48:10',NULL,NULL,'2026-09-23 17:48:10','2026-09-23 17:48:10'),(83,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNkRFMTZCOEVDRTIxRDRDNEIxAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNkRFMTZCOEVDRTIxRDRDNEIxAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:48:10',NULL,NULL,'2026-09-23 17:48:11','2026-09-23 17:48:11'),(84,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMzc4RThEQjg2MUYzRDI4MTlFAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMzc4RThEQjg2MUYzRDI4MTlFAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:48:11',NULL,NULL,'2026-09-23 17:48:12','2026-09-23 17:48:12'),(85,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSREQ0RjI5MzFBMTBGNzlGMjRGAA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSREQ0RjI5MzFBMTBGNzlGMjRGAA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:48:12','2026-09-23 19:48:13','2026-09-23 19:48:13','2026-09-23 17:48:13','2026-09-23 17:48:13'),(86,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRkI5RDRCQjJEOTM2RTI2RjlFAA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRkI5RDRCQjJEOTM2RTI2RjlFAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:51:46',NULL,NULL,'2026-09-23 17:51:48','2026-09-23 17:51:48'),(87,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMjFBRUIyRjAzQjkzOEU2QjlEAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMjFBRUIyRjAzQjkzOEU2QjlEAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:51:48',NULL,NULL,'2026-09-23 17:51:49','2026-09-23 17:51:49'),(88,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDExYjU1YmVhMQ==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:51:49',NULL,NULL,'2026-09-23 17:51:49','2026-09-23 17:51:49'),(89,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMzczNzAzNjdEMEU0NDIzMjUzAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSMzczNzAzNjdEMEU0NDIzMjUzAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:51:49',NULL,NULL,'2026-09-23 17:51:50','2026-09-23 17:51:50'),(90,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSRjQ4MzAwQ0RDNUQ4RDgxRUM4AA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSRjQ4MzAwQ0RDNUQ4RDgxRUM4AA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:51:50',NULL,NULL,'2026-09-23 17:51:51','2026-09-23 17:51:51'),(91,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQzMyREM4MEMyQzA4NDNFQTg4AA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQzMyREM4MEMyQzA4NDNFQTg4AA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:51:51','2026-09-23 19:51:52','2026-09-23 19:51:52','2026-09-23 17:51:52','2026-09-23 17:51:52'),(92,1,'+917021889883','Test Recipient','whatsapp','custom_broadcast',NULL,'Automated test broadcast for unit verification','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQUUxRDA1RERDNzFFRjVEMTZGAA==','sent','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Automated test broadcast for unit verification\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"917021889883\",\"message_id\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSQUUxRDA1RERDNzFFRjVEMTZGAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:57:30',NULL,NULL,'2026-09-23 17:57:33','2026-09-23 17:57:33'),(93,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','leave_approval','hrms_leave_decision','Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\n\nRemarks: Enjoy your vacation\nStatus: Approved\nAcme Global HRMS','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSOEU3MTU1RDJDODY5NTk3MDAyAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_leave_decision\",\"text\":\"Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-10-22 to 2026-10-22 (1.0 days) has been Approved by Manager Test.\\n\\nRemarks: Enjoy your vacation\\nStatus: Approved\\nAcme Global HRMS\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSOEU3MTU1RDJDODY5NTk3MDAyAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:57:33',NULL,NULL,'2026-09-23 17:57:36','2026-09-23 17:57:36'),(94,2,'+1 555-0199','Emma Walker','whatsapp','salary_disbursal','hrms_salary_credit','Dear Emma Walker, your salary for December 2021 of Γé╣7,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll','wamid.SEJnTTE1NTUwMTk5NmFiNDEzMTA1ZWJkZg==','sent','{\"to\":[\"15550199\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_salary_credit\",\"text\":\"Dear Emma Walker, your salary for December 2021 of \\u20b97,800.00 has been disbursed via Direct Bank NEFT (Ref: TEST-TXN-9988).\\n\\nView or download your digital payslip: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Global Payroll\",\"language\":\"en\"}}','{\"message\":\"country routing not allowed.\"}',NULL,'2026-09-23 19:57:36',NULL,NULL,'2026-09-23 17:57:36','2026-09-23 17:57:36'),(95,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','onboarding_welcome','hrms_welcome_onboarding','Welcome to Acme Global, Abu Bin Ishtiyak! ≡ƒÄë We are thrilled to have you join our team as Admin.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQzlBMTJFRjY2NUUxMEM5QzVBAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_welcome_onboarding\",\"text\":\"Welcome to Acme Global, Abu Bin Ishtiyak! \\ud83c\\udf89 We are thrilled to have you join our team as Admin.\\n\\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http:\\/\\/localhost:5173\\/hrms\\/lifecycle\\n\\nPlease reach out to HR Operations for any questions.\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSQzlBMTJFRjY2NUUxMEM5QzVBAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:57:36',NULL,NULL,'2026-09-23 17:57:37','2026-09-23 17:57:37'),(96,1,'+811 847-4958','Abu Bin Ishtiyak','whatsapp','attendance_alert','hrms_attendance_alert','Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk','wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNDNDQkRCQjZEQTY5MTdDRTFEAA==','sent','{\"to\":[\"918118474958\"],\"message\":{\"type\":\"template\",\"template_name\":\"hrms_attendance_alert\",\"text\":\"Attendance Notice: Hi Abu Bin Ishtiyak, our attendance records indicate you have not clocked in past the 10:00 AM grace period on 2026-09-23.\\n\\nPlease log in to the ESS Portal to record or regularize: http:\\/\\/localhost:5173\\/hrms\\/ess\\nAcme Operations Desk\",\"language\":\"en\"}}','{\"statuses\":[{\"reason\":\"\",\"recipient\":\"918118474958\",\"message_id\":\"wamid.HBgMOTE4MTE4NDc0OTU4FQIAERgSNDNDQkRCQjZEQTY5MTdDRTFEAA==\",\"status\":\"success\"}],\"type\":\"whatsapp\"}',NULL,'2026-09-23 19:57:37',NULL,NULL,'2026-09-23 17:57:38','2026-09-23 17:57:38'),(97,NULL,'+917021889883',NULL,'whatsapp','custom_broadcast',NULL,'Receipt transition test','wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRDk5NkM2NDcxMkI4RTdFNDMzAA==','read','{\"to\":[\"917021889883\"],\"message\":{\"type\":\"text\",\"template_name\":null,\"text\":\"Receipt transition test\",\"language\":\"en\"}}','{\"callback_type\":\"status\",\"messageId\":\"wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSRDk5NkM2NDcxMkI4RTdFNDMzAA==\",\"status\":\"read\"}',NULL,'2026-09-23 19:57:38','2026-09-23 19:57:39','2026-09-23 19:57:39','2026-09-23 17:57:39','2026-09-23 17:57:39');
/*!40000 ALTER TABLE `notification_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_settings`
--

DROP TABLE IF EXISTS `notification_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_settings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `trigger_key` varchar(60) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `channel` enum('whatsapp','sms','both') NOT NULL DEFAULT 'whatsapp',
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `template_name` varchar(100) DEFAULT NULL,
  `template_text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `trigger_key` (`trigger_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_settings`
--

LOCK TABLES `notification_settings` WRITE;
/*!40000 ALTER TABLE `notification_settings` DISABLE KEYS */;
INSERT INTO `notification_settings` VALUES (1,'leave_approval','Leave Approvals & Rejections','Instant WhatsApp notification when an employee leave application is approved or rejected by management.','whatsapp',1,'hrms_leave_decision','Hello {{employee_name}}, your leave request for {{leave_type}} from {{start_date}} to {{end_date}} ({{days}} days) has been {{status}} by {{approver_name}}.\n\nRemarks: {{remarks}}\nStatus: {{status}}\nAcme Global HRMS','2026-09-23 16:58:16','2026-09-23 16:58:16'),(2,'salary_disbursal','Salary Disbursal & Slip Download','Notifies employees when monthly payroll has been disbursed, including net salary and direct download link.','whatsapp',1,'hrms_salary_credit','Dear {{employee_name}}, your salary for {{month_year}} of Γé╣{{net_salary}} has been disbursed via {{payment_method}} (Ref: {{payment_ref}}).\n\nView or download your digital payslip: {{payslip_url}}\nAcme Global Payroll','2026-09-23 16:58:16','2026-09-23 16:58:16'),(3,'onboarding_welcome','Day-1 Onboarding Welcome','Sends warm welcome greetings and the Day-1 orientation roadmap link to newly onboarded team members.','whatsapp',1,'hrms_welcome_onboarding','Welcome to Acme Global, {{employee_name}}! ≡ƒÄë We are thrilled to have you join our team as {{designation}}.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: {{onboarding_url}}\n\nPlease reach out to HR Operations for any questions.','2026-09-23 16:58:16','2026-09-23 16:58:16'),(4,'attendance_alert','Attendance Alerts (Late & Missing Checkout)','Automated alerts for grace-period late punch-in reminders and end-of-shift missing checkout warnings.','both',1,'hrms_attendance_alert','Attendance Notice: Hi {{employee_name}}, {{alert_message}} on {{date}}.\n\nPlease log in to the ESS Portal to record or regularize: {{ess_url}}\nAcme Operations Desk','2026-09-23 16:58:16','2026-09-23 16:58:16');
/*!40000 ALTER TABLE `notification_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','danger') NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'Withdrawal Requested','You have requested a withdrawal.','warning',0,'2026-09-22 19:42:15'),(2,1,'Deposit Placed','Your Deposit Order is placed.','success',0,'2026-09-22 19:42:15');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_components`
--

DROP TABLE IF EXISTS `payroll_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payroll_components` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('Earning','Deduction') NOT NULL,
  `category` enum('Basic','Allowance','Variable','Statutory','Insurance','Stipend','Deduction') NOT NULL DEFAULT 'Allowance',
  `calculation_type` enum('Flat','Percentage') NOT NULL DEFAULT 'Flat',
  `default_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `applies_to` enum('All','Permanent','Temporary','Intern') NOT NULL DEFAULT 'All',
  `is_taxable` tinyint(1) NOT NULL DEFAULT 1,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_components`
--

LOCK TABLES `payroll_components` WRITE;
/*!40000 ALTER TABLE `payroll_components` DISABLE KEYS */;
INSERT INTO `payroll_components` VALUES (1,'Basic Salary','BASIC','Earning','Basic','Flat',2500.00,'Permanent',1,1,1,'Base regular monthly salary for permanent personnel','2026-09-23 07:10:09','2026-09-23 07:10:09'),(2,'House Rent Allowance (HRA)','HRA','Earning','Allowance','Percentage',20.00,'Permanent',1,0,1,'Housing allowance calculated as a percentage of basic salary','2026-09-23 07:10:09','2026-09-23 07:10:09'),(3,'Medical Allowance','MEDICAL','Earning','Allowance','Flat',200.00,'All',0,0,1,'Healthcare and medical expenditure allowance','2026-09-23 07:10:09','2026-09-23 07:10:09'),(4,'Conveyance / Transport Allowance','CONVEYANCE','Earning','Allowance','Flat',150.00,'All',1,0,1,'Monthly commuting and travel allowance','2026-09-23 07:10:09','2026-09-23 07:10:09'),(5,'Performance Variable / Bonus','VARIABLE_BONUS','Earning','Variable','Flat',0.00,'All',1,0,1,'Incentive, quarterly variable or performance bonus','2026-09-23 07:10:09','2026-09-23 07:10:09'),(6,'Monthly Stipend','STIPEND','Earning','Stipend','Flat',800.00,'Intern',0,1,1,'Standard monthly educational stipend for interns','2026-09-23 07:10:09','2026-09-23 07:10:09'),(7,'Provident Fund (EPF)','PF','Deduction','Statutory','Percentage',12.00,'Permanent',0,1,1,'Employee contribution to retirement provident fund','2026-09-23 07:10:09','2026-09-23 07:10:09'),(8,'Health & Mediclaim Insurance','INSURANCE','Deduction','Insurance','Flat',75.00,'All',0,0,1,'Group health insurance and medical coverage premium','2026-09-23 07:10:09','2026-09-23 07:10:09'),(9,'Income Tax (TDS)','TAX','Deduction','Statutory','Flat',120.00,'All',0,0,1,'Monthly tax deducted at source based on annual tax slab','2026-09-23 07:10:09','2026-09-23 07:10:09'),(10,'Loss of Pay (LOP)','LOP','Deduction','Deduction','Flat',0.00,'All',0,0,1,'Deductions for unapproved absences and leaves beyond quota','2026-09-23 07:10:09','2026-09-23 07:10:09');
/*!40000 ALTER TABLE `payroll_components` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_competencies`
--

DROP TABLE IF EXISTS `performance_competencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `performance_competencies` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'Core Values',
  `description` text DEFAULT NULL,
  `weight_pct` int(10) unsigned NOT NULL DEFAULT 20,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_competencies`
--

LOCK TABLES `performance_competencies` WRITE;
/*!40000 ALTER TABLE `performance_competencies` DISABLE KEYS */;
INSERT INTO `performance_competencies` VALUES (1,'Technical Excellence & Quality','Functional Skills','Demonstrates high engineering standards, clean code architecture, and thoroughness.',25,1,'2026-09-23 16:41:38'),(2,'Ownership & Accountability','Core Values','Takes end-to-end responsibility for milestones, anticipates roadblocks, and delivers on commitments.',20,1,'2026-09-23 16:41:38'),(3,'Communication & Collaboration','Core Values','Shares knowledge proactively, supports cross-functional peers, and resolves conflicts constructively.',20,1,'2026-09-23 16:41:38'),(4,'Problem Solving & Innovation','Functional Skills','Proposes creative, efficient solutions to complex business bottlenecks and optimizes processes.',20,1,'2026-09-23 16:41:38'),(5,'Delivery Velocity & Reliability','Execution','Consistently hits project deadlines with predictable velocity and resilient system uptime.',15,1,'2026-09-23 16:41:38');
/*!40000 ALTER TABLE `performance_competencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_cycles`
--

DROP TABLE IF EXISTS `performance_cycles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `performance_cycles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `period_type` enum('Quarterly','Bi-Annual','Annual') NOT NULL DEFAULT 'Annual',
  `year` int(10) unsigned NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `self_review_deadline` date NOT NULL,
  `manager_review_deadline` date NOT NULL,
  `status` enum('Draft','Active','In Review','Calibration','Finalized','Archived') NOT NULL DEFAULT 'Active',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_cycles`
--

LOCK TABLES `performance_cycles` WRITE;
/*!40000 ALTER TABLE `performance_cycles` DISABLE KEYS */;
INSERT INTO `performance_cycles` VALUES (1,'FY2026 Enterprise Performance & OKR Cycle','Annual',2026,'2026-01-01','2026-12-31','2026-11-15','2026-12-05','Active','Company-wide annual appraisal, 360 peer feedback, and salary revision appraisal review.','2026-09-23 16:41:38','2026-09-23 16:41:38');
/*!40000 ALTER TABLE `performance_cycles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_key_results`
--

DROP TABLE IF EXISTS `performance_key_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `performance_key_results` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `okr_id` int(10) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `metric_type` enum('percentage','number','currency','boolean') NOT NULL DEFAULT 'percentage',
  `start_value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `target_value` decimal(12,2) NOT NULL DEFAULT 100.00,
  `current_value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `weight_pct` int(10) unsigned NOT NULL DEFAULT 100,
  `progress_pct` int(10) unsigned NOT NULL DEFAULT 0,
  `status` enum('Pending','On Track','Behind','Achieved') NOT NULL DEFAULT 'On Track',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `okr_id` (`okr_id`),
  CONSTRAINT `performance_key_results_ibfk_1` FOREIGN KEY (`okr_id`) REFERENCES `performance_okrs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_key_results`
--

LOCK TABLES `performance_key_results` WRITE;
/*!40000 ALTER TABLE `performance_key_results` DISABLE KEYS */;
INSERT INTO `performance_key_results` VALUES (1,1,'Achieve sub-50ms API response latency for 100k pharmacology records','number',250.00,50.00,60.00,50,80,'On Track','2026-09-23 16:41:38','2026-09-23 16:41:38'),(2,1,'Implement 100% automated test coverage for critical contraindication logic','percentage',0.00,100.00,70.00,50,70,'On Track','2026-09-23 16:41:38','2026-09-23 16:41:38'),(3,2,'Conduct 3 quarterly security & privacy audit simulations with zero vulnerabilities','number',0.00,3.00,2.00,50,66,'On Track','2026-09-23 16:41:38','2026-09-23 16:41:38'),(4,2,'Publish comprehensive pharmacology API developer documentation','boolean',0.00,1.00,1.00,50,100,'Achieved','2026-09-23 16:41:38','2026-09-23 16:41:38'),(5,3,'Mentor 4 senior engineers into tech lead roles','number',0.00,4.00,3.00,50,75,'On Track','2026-09-23 16:41:38','2026-09-23 16:41:38'),(6,3,'Maintain team sprint completion rate above 92%','percentage',70.00,95.00,93.00,50,95,'Achieved','2026-09-23 16:41:38','2026-09-23 16:41:38');
/*!40000 ALTER TABLE `performance_key_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_okrs`
--

DROP TABLE IF EXISTS `performance_okrs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `performance_okrs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cycle_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `objective_title` varchar(255) NOT NULL,
  `category` enum('Company Strategic','Department Milestone','Individual Growth','Operational Excellence') NOT NULL DEFAULT 'Department Milestone',
  `quarter` enum('Q1','Q2','Q3','Q4','Annual') NOT NULL DEFAULT 'Annual',
  `weight_pct` int(10) unsigned NOT NULL DEFAULT 100,
  `progress_pct` int(10) unsigned NOT NULL DEFAULT 0,
  `status` enum('Not Started','In Progress','At Risk','Completed') NOT NULL DEFAULT 'In Progress',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cycle_id` (`cycle_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `performance_okrs_ibfk_1` FOREIGN KEY (`cycle_id`) REFERENCES `performance_cycles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `performance_okrs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_okrs`
--

LOCK TABLES `performance_okrs` WRITE;
/*!40000 ALTER TABLE `performance_okrs` DISABLE KEYS */;
INSERT INTO `performance_okrs` VALUES (1,1,36,'Architect & Launch Next-Gen Clinical Drug Interaction Engine','Department Milestone','Q1',50,75,'In Progress','2026-09-23 16:41:38','2026-09-23 16:41:38'),(2,1,36,'Achieve 99.95% System Reliability and HIPAA Compliance Certification','Operational Excellence','Q2',50,60,'In Progress','2026-09-23 16:41:38','2026-09-23 16:41:38'),(3,1,2,'Scale Engineering Team Velocity and Reduce Cycle Time by 30%','Company Strategic','Annual',100,85,'In Progress','2026-09-23 16:41:38','2026-09-23 16:41:38');
/*!40000 ALTER TABLE `performance_okrs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_peer_feedbacks`
--

DROP TABLE IF EXISTS `performance_peer_feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `performance_peer_feedbacks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `review_id` int(10) unsigned NOT NULL,
  `reviewer_user_id` int(10) unsigned NOT NULL,
  `relationship` enum('Peer','Direct Report','Cross-Functional Partner') NOT NULL DEFAULT 'Peer',
  `rating` decimal(3,2) DEFAULT NULL,
  `feedback_text` text DEFAULT NULL,
  `status` enum('Requested','Submitted','Declined') NOT NULL DEFAULT 'Requested',
  `submitted_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `review_id` (`review_id`),
  KEY `reviewer_user_id` (`reviewer_user_id`),
  CONSTRAINT `performance_peer_feedbacks_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `performance_reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `performance_peer_feedbacks_ibfk_2` FOREIGN KEY (`reviewer_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_peer_feedbacks`
--

LOCK TABLES `performance_peer_feedbacks` WRITE;
/*!40000 ALTER TABLE `performance_peer_feedbacks` DISABLE KEYS */;
INSERT INTO `performance_peer_feedbacks` VALUES (1,1,2,'Peer',4.50,'Julian is super dependable and wrote the cleanest API endpoints in our sprint.','Submitted','2026-09-23 22:11:38','2026-09-23 16:41:38');
/*!40000 ALTER TABLE `performance_peer_feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_review_competency_scores`
--

DROP TABLE IF EXISTS `performance_review_competency_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `performance_review_competency_scores` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `review_id` int(10) unsigned NOT NULL,
  `competency_id` int(10) unsigned NOT NULL,
  `self_score` decimal(3,2) DEFAULT NULL,
  `manager_score` decimal(3,2) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `review_id` (`review_id`),
  KEY `competency_id` (`competency_id`),
  CONSTRAINT `performance_review_competency_scores_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `performance_reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `performance_review_competency_scores_ibfk_2` FOREIGN KEY (`competency_id`) REFERENCES `performance_competencies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_review_competency_scores`
--

LOCK TABLES `performance_review_competency_scores` WRITE;
/*!40000 ALTER TABLE `performance_review_competency_scores` DISABLE KEYS */;
INSERT INTO `performance_review_competency_scores` VALUES (1,1,1,4.50,4.60,'Consistently high quality code and architecture.','2026-09-23 16:41:38'),(2,1,2,4.00,4.20,'Strong ownership across product releases.','2026-09-23 16:41:38'),(3,1,3,4.00,4.00,'Clear communication in sprint reviews.','2026-09-23 16:41:38'),(4,1,4,4.30,4.50,'Proactive optimization of queries.','2026-09-23 16:41:38'),(5,1,5,4.20,4.30,'Hits project milestones reliably.','2026-09-23 16:41:38'),(6,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 16:43:40'),(7,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 16:43:40'),(8,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 16:46:11'),(9,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 16:46:11'),(10,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:03:57'),(11,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:03:57'),(12,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:05:25'),(13,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:05:25'),(14,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:08:32'),(15,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:08:32'),(16,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:13:02'),(17,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:13:02'),(18,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:13:32'),(19,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:13:32'),(20,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:14:07'),(21,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:14:07'),(22,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:16:49'),(23,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:16:49'),(24,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:22:57'),(25,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:22:57'),(26,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:34:40'),(27,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:34:40'),(28,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:46:16'),(29,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:46:16'),(30,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:47:14'),(31,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:47:14'),(32,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:47:44'),(33,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:47:44'),(34,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:48:07'),(35,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:48:07'),(36,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:51:46'),(37,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:51:46'),(38,1,1,4.80,NULL,'Architected robust modular pipelines.','2026-09-23 17:57:30'),(39,1,2,4.50,NULL,'Took complete ownership of production releases.','2026-09-23 17:57:30');
/*!40000 ALTER TABLE `performance_review_competency_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_reviews`
--

DROP TABLE IF EXISTS `performance_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `performance_reviews` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cycle_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `manager_id` int(10) unsigned NOT NULL,
  `self_rating` decimal(3,2) DEFAULT NULL,
  `self_comments` text DEFAULT NULL,
  `self_submitted_at` datetime DEFAULT NULL,
  `manager_rating` decimal(3,2) DEFAULT NULL,
  `manager_potential_rating` enum('Low','Medium','High') DEFAULT 'Medium',
  `manager_performance_rating` enum('Low','Medium','High') DEFAULT 'Medium',
  `nine_box_quadrant` varchar(60) DEFAULT NULL,
  `manager_comments` text DEFAULT NULL,
  `strengths` text DEFAULT NULL,
  `growth_areas` text DEFAULT NULL,
  `manager_submitted_at` datetime DEFAULT NULL,
  `peer_feedback_summary` text DEFAULT NULL,
  `final_rating` decimal(3,2) DEFAULT NULL,
  `recommended_increment_pct` decimal(5,2) NOT NULL DEFAULT 0.00,
  `payroll_increment_applied` tinyint(1) NOT NULL DEFAULT 0,
  `payroll_applied_at` datetime DEFAULT NULL,
  `status` enum('Pending Self-Review','Pending Manager Review','Calibrating','Finalized','Acknowledged') NOT NULL DEFAULT 'Pending Self-Review',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cycle_id` (`cycle_id`),
  KEY `user_id` (`user_id`),
  KEY `manager_id` (`manager_id`),
  CONSTRAINT `performance_reviews_ibfk_1` FOREIGN KEY (`cycle_id`) REFERENCES `performance_cycles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `performance_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `performance_reviews_ibfk_3` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_reviews`
--

LOCK TABLES `performance_reviews` WRITE;
/*!40000 ALTER TABLE `performance_reviews` DISABLE KEYS */;
INSERT INTO `performance_reviews` VALUES (1,1,36,2,4.50,'Delivered all pharmacology services ahead of schedule and mentored team on unit testing.','2026-09-23 23:27:30',4.60,'High','High','Star / Future Leader','Julian is a standout technical lead with strong initiative.','Architecture, code hygiene, dependability.','Executive presentation skills.','2026-09-23 23:27:30',NULL,4.55,15.00,1,'2026-09-23 23:27:30','Finalized','2026-09-23 16:41:38','2026-09-23 17:57:30'),(2,1,2,1,4.10,'Completed deliverables.','2026-09-23 22:11:38',4.10,'Medium','High','High Performer','Solid overall execution.',NULL,NULL,NULL,NULL,4.10,10.00,0,NULL,'Finalized','2026-09-23 16:41:38','2026-09-23 16:41:38');
/*!40000 ALTER TABLE `performance_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `module` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'View Members','view_members','members','2026-09-22 19:42:15'),(2,'Add Member','add_member','members','2026-09-22 19:42:15'),(3,'Edit Member','edit_member','members','2026-09-22 19:42:15'),(4,'Delete Member','delete_member','members','2026-09-22 19:42:15'),(5,'View Attendance','view_attendance','attendance','2026-09-22 19:42:15'),(6,'Mark Attendance','mark_attendance','attendance','2026-09-22 19:42:15'),(7,'View Salary','view_salary','salary','2026-09-22 19:42:15'),(8,'Manage Salary','manage_salary','salary','2026-09-22 19:42:15');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_permissions` (
  `role_id` int(10) unsigned NOT NULL,
  `permission_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(2,1),(2,2),(2,3),(2,5),(2,6),(2,7),(3,5),(4,1),(4,7),(4,8);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','admin','Full system access and member management','2026-09-22 19:42:15','2026-09-22 19:42:15'),(2,'Manager','manager','Operational management and attendance/salary approval','2026-09-22 19:42:15','2026-09-22 19:42:15'),(3,'Pharmacist','pharmacist','Pharmacy and inventory team member','2026-09-22 19:42:15','2026-09-22 19:42:15'),(4,'Accountant','accountant','Financial and payroll management','2026-09-22 19:42:15','2026-09-22 19:42:15'),(5,'Salesman','salesman','Point of sale and front-desk member','2026-09-22 19:42:15','2026-09-22 19:42:15'),(6,'Cleaner','cleaner','Facility and maintenance staff','2026-09-22 19:42:15','2026-09-22 19:42:15');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salaries`
--

DROP TABLE IF EXISTS `salaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salaries` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `employment_type` enum('Permanent','Temporary','Intern') NOT NULL DEFAULT 'Permanent',
  `salary_date` date NOT NULL,
  `gross_salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_deductions` decimal(12,2) NOT NULL DEFAULT 0.00,
  `net_salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `working_days` int(10) unsigned NOT NULL DEFAULT 0,
  `generated_by` int(10) unsigned NOT NULL,
  `status` enum('Paid','Unpaid','Pending') NOT NULL DEFAULT 'Unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `generated_by` (`generated_by`),
  CONSTRAINT `salaries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `salaries_ibfk_2` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salaries`
--

LOCK TABLES `salaries` WRITE;
/*!40000 ALTER TABLE `salaries` DISABLE KEYS */;
INSERT INTO `salaries` VALUES (1,2,'Permanent','2021-12-12',7800.00,0.00,7800.00,7800.00,'USD',22,1,'Unpaid','2026-09-22 19:42:15','2026-09-23 07:10:09');
/*!40000 ALTER TABLE `salaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_increments`
--

DROP TABLE IF EXISTS `salary_increments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salary_increments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `review_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `old_base_salary` decimal(12,2) NOT NULL,
  `increment_pct` decimal(5,2) NOT NULL,
  `increment_amount` decimal(12,2) NOT NULL,
  `new_base_salary` decimal(12,2) NOT NULL,
  `effective_date` date NOT NULL,
  `processed_by` int(10) unsigned NOT NULL,
  `status` enum('Approved','Applied to Payroll') NOT NULL DEFAULT 'Applied to Payroll',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `review_id` (`review_id`),
  KEY `user_id` (`user_id`),
  KEY `processed_by` (`processed_by`),
  CONSTRAINT `salary_increments_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `performance_reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `salary_increments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `salary_increments_ibfk_3` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_increments`
--

LOCK TABLES `salary_increments` WRITE;
/*!40000 ALTER TABLE `salary_increments` DISABLE KEYS */;
INSERT INTO `salary_increments` VALUES (1,1,36,5000.00,15.00,750.00,5750.00,'2026-09-23',1,'Applied to Payroll','2026-09-23 16:43:40'),(2,1,36,5750.00,15.00,862.50,6612.50,'2026-09-23',1,'Applied to Payroll','2026-09-23 16:46:11'),(3,1,36,6612.50,15.00,991.88,7604.38,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:03:57'),(4,1,36,7604.38,15.00,1140.66,8745.04,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:05:25'),(5,1,36,8745.04,15.00,1311.76,10056.80,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:08:32'),(6,1,36,10056.80,15.00,1508.52,11565.32,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:13:02'),(7,1,36,11565.32,15.00,1734.80,13300.12,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:13:32'),(8,1,36,13300.12,15.00,1995.02,15295.14,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:14:07'),(9,1,36,15295.14,15.00,2294.27,17589.41,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:16:49'),(10,1,36,17589.41,15.00,2638.41,20227.82,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:22:57'),(11,1,36,20227.82,15.00,3034.17,23261.99,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:34:40'),(12,1,36,23261.99,15.00,3489.30,26751.29,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:46:16'),(13,1,36,26751.29,15.00,4012.69,30763.98,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:47:14'),(14,1,36,30763.98,15.00,4614.60,35378.58,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:47:44'),(15,1,36,35378.58,15.00,5306.79,40685.37,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:48:07'),(16,1,36,40685.37,15.00,6102.81,46788.18,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:51:46'),(17,1,36,46788.18,15.00,7018.23,53806.41,'2026-09-23',1,'Applied to Payroll','2026-09-23 17:57:30');
/*!40000 ALTER TABLE `salary_increments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_items`
--

DROP TABLE IF EXISTS `salary_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salary_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `salary_id` int(10) unsigned NOT NULL,
  `component_id` int(10) unsigned DEFAULT NULL,
  `component_name` varchar(100) NOT NULL,
  `type` enum('Earning','Deduction') NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'General',
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `salary_id` (`salary_id`),
  KEY `component_id` (`component_id`),
  CONSTRAINT `salary_items_ibfk_1` FOREIGN KEY (`salary_id`) REFERENCES `salaries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `salary_items_ibfk_2` FOREIGN KEY (`component_id`) REFERENCES `payroll_components` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=267 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_items`
--

LOCK TABLES `salary_items` WRITE;
/*!40000 ALTER TABLE `salary_items` DISABLE KEYS */;
INSERT INTO `salary_items` VALUES (211,1,NULL,'Night Shift Allowance','Earning','Allowance',350.00,'2026-09-23 17:14:12'),(212,1,NULL,'Overtime Pay (OT)','Earning','Allowance',562.50,'2026-09-23 17:14:12');
/*!40000 ALTER TABLE `salary_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_payments`
--

DROP TABLE IF EXISTS `salary_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salary_payments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `salary_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `amount_paid` decimal(12,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` enum('Cash','Bank Transfer','Cheque','Online') NOT NULL DEFAULT 'Bank Transfer',
  `transaction_ref` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `salary_id` (`salary_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `salary_payments_ibfk_1` FOREIGN KEY (`salary_id`) REFERENCES `salaries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `salary_payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_payments`
--

LOCK TABLES `salary_payments` WRITE;
/*!40000 ALTER TABLE `salary_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `salary_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shift_overtime_records`
--

DROP TABLE IF EXISTS `shift_overtime_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shift_overtime_records` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `attendance_id` int(10) unsigned DEFAULT NULL,
  `shift_id` int(10) unsigned DEFAULT NULL,
  `date` date NOT NULL,
  `scheduled_hours` decimal(5,2) NOT NULL DEFAULT 8.00,
  `actual_hours` decimal(5,2) NOT NULL DEFAULT 8.00,
  `overtime_hours` decimal(5,2) NOT NULL DEFAULT 0.00,
  `is_night_shift` tinyint(1) NOT NULL DEFAULT 0,
  `night_differential_pay` decimal(10,2) NOT NULL DEFAULT 0.00,
  `overtime_pay` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payroll_synced` tinyint(1) NOT NULL DEFAULT 0,
  `salary_id` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ot_user_date` (`user_id`,`date`),
  KEY `idx_ot_synced` (`payroll_synced`),
  CONSTRAINT `shift_overtime_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shift_overtime_records`
--

LOCK TABLES `shift_overtime_records` WRITE;
/*!40000 ALTER TABLE `shift_overtime_records` DISABLE KEYS */;
INSERT INTO `shift_overtime_records` VALUES (1,1,NULL,3,'2026-09-22',8.00,10.50,2.50,1,350.00,562.50,1,1,'2026-09-23 17:10:43','2026-09-23 17:14:12');
/*!40000 ALTER TABLE `shift_overtime_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shift_rosters`
--

DROP TABLE IF EXISTS `shift_rosters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shift_rosters` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `shift_id` int(10) unsigned DEFAULT NULL,
  `date` date NOT NULL,
  `is_off_day` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('Scheduled','Completed','Swapped','Absent') NOT NULL DEFAULT 'Scheduled',
  `notes` varchar(255) DEFAULT NULL,
  `assigned_by` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`user_id`,`date`),
  KEY `idx_roster_date` (`date`),
  KEY `idx_roster_status` (`status`),
  KEY `shift_id` (`shift_id`),
  CONSTRAINT `shift_rosters_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shift_rosters_ibfk_2` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shift_rosters`
--

LOCK TABLES `shift_rosters` WRITE;
/*!40000 ALTER TABLE `shift_rosters` DISABLE KEYS */;
INSERT INTO `shift_rosters` VALUES (1,1,1,'2026-09-01',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(2,1,1,'2026-09-02',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(3,1,1,'2026-09-03',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(4,1,1,'2026-09-04',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(5,1,NULL,'2026-09-05',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(6,1,NULL,'2026-09-06',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(7,1,1,'2026-09-07',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(8,1,1,'2026-09-08',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(9,1,1,'2026-09-09',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(10,1,1,'2026-09-10',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(11,1,1,'2026-09-11',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(12,1,NULL,'2026-09-12',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(13,1,NULL,'2026-09-13',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(14,1,1,'2026-09-14',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(15,1,1,'2026-09-15',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(16,1,1,'2026-09-16',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(17,1,1,'2026-09-17',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(18,1,1,'2026-09-18',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(19,1,NULL,'2026-09-19',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(20,1,NULL,'2026-09-20',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(21,1,1,'2026-09-21',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(22,1,1,'2026-09-22',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(23,1,1,'2026-09-23',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(24,1,1,'2026-09-24',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(25,1,1,'2026-09-25',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(26,1,NULL,'2026-09-26',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(27,1,NULL,'2026-09-27',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(28,1,1,'2026-09-28',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(29,1,1,'2026-09-29',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(30,1,1,'2026-09-30',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(31,2,2,'2026-09-01',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(32,2,2,'2026-09-02',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(33,2,2,'2026-09-03',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(34,2,2,'2026-09-04',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(35,2,NULL,'2026-09-05',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(36,2,NULL,'2026-09-06',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(37,2,2,'2026-09-07',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(38,2,2,'2026-09-08',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(39,2,2,'2026-09-09',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(40,2,2,'2026-09-10',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(41,2,2,'2026-09-11',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(42,2,NULL,'2026-09-12',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(43,2,NULL,'2026-09-13',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(44,2,2,'2026-09-14',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(45,2,2,'2026-09-15',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(46,2,2,'2026-09-16',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(47,2,2,'2026-09-17',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(48,2,2,'2026-09-18',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(49,2,NULL,'2026-09-19',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(50,2,NULL,'2026-09-20',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(51,2,2,'2026-09-21',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(52,2,2,'2026-09-22',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(53,2,2,'2026-09-23',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(54,2,2,'2026-09-24',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(55,2,2,'2026-09-25',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(56,2,NULL,'2026-09-26',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(57,2,NULL,'2026-09-27',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(58,2,2,'2026-09-28',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(59,2,2,'2026-09-29',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(60,2,2,'2026-09-30',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(61,36,3,'2026-09-01',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(62,36,3,'2026-09-02',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(63,36,3,'2026-09-03',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(64,36,3,'2026-09-04',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(65,36,NULL,'2026-09-05',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(66,36,NULL,'2026-09-06',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(67,36,3,'2026-09-07',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(68,36,3,'2026-09-08',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(69,36,3,'2026-09-09',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(70,36,3,'2026-09-10',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(71,36,2,'2026-09-11',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:16:33'),(72,36,NULL,'2026-09-12',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(73,36,NULL,'2026-09-13',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(74,36,3,'2026-09-14',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(75,36,3,'2026-09-15',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(76,36,3,'2026-09-16',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(77,36,3,'2026-09-17',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(78,36,3,'2026-09-18',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(79,36,NULL,'2026-09-19',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(80,36,NULL,'2026-09-20',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(81,36,3,'2026-09-21',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(82,36,3,'2026-09-22',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(83,36,3,'2026-09-23',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(84,36,3,'2026-09-24',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(85,36,3,'2026-09-25',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(86,36,NULL,'2026-09-26',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(87,36,NULL,'2026-09-27',1,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(88,36,3,'2026-09-28',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(89,36,3,'2026-09-29',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(90,36,3,'2026-09-30',0,'Scheduled',NULL,1,'2026-09-23 17:10:43','2026-09-23 17:10:43');
/*!40000 ALTER TABLE `shift_rosters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shift_swaps`
--

DROP TABLE IF EXISTS `shift_swaps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shift_swaps` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `requester_id` int(10) unsigned NOT NULL,
  `receiver_id` int(10) unsigned NOT NULL,
  `roster_id` int(10) unsigned NOT NULL,
  `swap_date` date NOT NULL,
  `target_shift_id` int(10) unsigned DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `receiver_status` enum('Pending','Accepted','Declined') NOT NULL DEFAULT 'Pending',
  `manager_status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `manager_remarks` varchar(255) DEFAULT NULL,
  `approved_by` int(10) unsigned DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_swap_requester` (`requester_id`),
  KEY `idx_swap_receiver` (`receiver_id`),
  KEY `idx_swap_manager_status` (`manager_status`),
  KEY `roster_id` (`roster_id`),
  CONSTRAINT `shift_swaps_ibfk_1` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shift_swaps_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shift_swaps_ibfk_3` FOREIGN KEY (`roster_id`) REFERENCES `shift_rosters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shift_swaps`
--

LOCK TABLES `shift_swaps` WRITE;
/*!40000 ALTER TABLE `shift_swaps` DISABLE KEYS */;
INSERT INTO `shift_swaps` VALUES (1,1,2,24,'2026-09-24',NULL,'Attending clinical training seminar','Accepted','Pending',NULL,NULL,NULL,'2026-09-23 17:10:43','2026-09-23 17:10:43');
/*!40000 ALTER TABLE `shift_swaps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shifts`
--

DROP TABLE IF EXISTS `shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shifts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `shift_code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `grace_period_mins` int(10) unsigned NOT NULL DEFAULT 15,
  `break_duration_mins` int(10) unsigned NOT NULL DEFAULT 60,
  `color` varchar(30) NOT NULL DEFAULT '#10b981',
  `is_night_shift` tinyint(1) NOT NULL DEFAULT 0,
  `night_allowance_amt` decimal(10,2) NOT NULL DEFAULT 0.00,
  `overtime_multiplier` decimal(3,2) NOT NULL DEFAULT 1.50,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `shift_code` (`shift_code`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shifts`
--

LOCK TABLES `shifts` WRITE;
/*!40000 ALTER TABLE `shifts` DISABLE KEYS */;
INSERT INTO `shifts` VALUES (1,'MORN-01','Morning General Shift','Standard daytime shift for administrative, engineering and support staff.','08:30:00','17:00:00',15,60,'#10b981',0,0.00,1.50,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(2,'EVE-02','Evening Swing Shift','Late afternoon to night shift for operational handover and clinical support.','14:30:00','23:00:00',15,45,'#3b82f6',0,150.00,1.50,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(3,'NIGHT-03','Night Owls Differential','Overnight healthcare and IT server monitoring shift with statutory differential allowance.','22:30:00','07:00:00',10,60,'#8b5cf6',1,350.00,1.75,1,'2026-09-23 17:10:43','2026-09-23 17:10:43'),(4,'ROT-04','12-Hour Critical Care Roster','Rotational extended shift for hospital pharmacy and emergency operations.','08:00:00','20:00:00',20,90,'#f59e0b',0,200.00,2.00,1,'2026-09-23 17:10:43','2026-09-23 17:10:43');
/*!40000 ALTER TABLE `shifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_documents`
--

DROP TABLE IF EXISTS `user_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_documents` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `document_type` enum('National Id','Certificates','Resume','Contract','Passport','Other') NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_documents`
--

LOCK TABLES `user_documents` WRITE;
/*!40000 ALTER TABLE `user_documents` DISABLE KEYS */;
INSERT INTO `user_documents` VALUES (1,1,'National Id','National ID Card.pdf','/uploads/documents/nid_1.pdf','2026-09-22 19:42:15'),(2,1,'Certificates','Pharmacy License & Degree.pdf','/uploads/documents/cert_1.pdf','2026-09-22 19:42:15');
/*!40000 ALTER TABLE `user_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_settings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `language` varchar(50) DEFAULT 'English (United States)',
  `date_format` varchar(20) DEFAULT 'M d, YYYY',
  `timezone` varchar(50) DEFAULT 'GMT +6',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
INSERT INTO `user_settings` VALUES (1,1,'English (United States)','M d, YYYY','GMT +6','2026-09-22 19:42:15'),(2,2,'English (United States)','M d, YYYY','GMT -5','2026-09-22 19:42:15');
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `display_name` varchar(100) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `address` text DEFAULT NULL,
  `designation` enum('Admin','Manager','Pharmacist','Accountant','Salesman','Cleaner') NOT NULL DEFAULT 'Pharmacist',
  `role_id` int(10) unsigned NOT NULL,
  `joining_date` date NOT NULL,
  `status` enum('Active','Inactive','Suspend') NOT NULL DEFAULT 'Active',
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Abu Bin Ishtiyak','Ishtiyak','info@softnio.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','+811 847-4958','0000-00-00','2337 Kildeer Drive, Kentucky, Canada','Admin',1,'2020-02-10','Active',NULL,'2026-09-22 19:42:15','2026-09-22 19:42:15'),(2,'Emma Walker','Emma','emma.walker@example.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','+1 555-0199','1992-07-15','45 Elm Street, Toronto, Canada','Manager',2,'2021-01-15','Active',NULL,'2026-09-22 19:42:15','2026-09-22 19:42:15'),(36,'Dr. Julian Morales','Julian','julian.morales@example.com','$2y$12$F1ExTBuVUYhls/YBSqDWVu8rtr4mdKUj6e2bBTghsCFmnwEFR2GFG','+1 555-0482','1990-05-14','742 Evergreen Terrace, Springfield','Pharmacist',3,'2022-03-01','Active',NULL,'2026-09-23 15:21:06','2026-09-23 15:21:06');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-23 23:39:16
