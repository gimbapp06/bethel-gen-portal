-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 08, 2026 at 07:29 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bethel_portal`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `reference_number` varchar(255) NOT NULL,
  `type` enum('policy','claim') NOT NULL DEFAULT 'policy',
  `status` enum('draft','submitted','under_review','pending_documents','approved','rejected','cancelled') NOT NULL DEFAULT 'draft',
  `property_details` text DEFAULT NULL,
  `estimated_premium` decimal(12,2) DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `user_id`, `product_id`, `reference_number`, `type`, `status`, `property_details`, `estimated_premium`, `admin_notes`, `rejection_reason`, `submitted_at`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'BGI-P-2026-17486', 'policy', 'pending_documents', '{\"property_type\":\"Residential\",\"property_address\":\"Rawis, Legazpi City\",\"construction_type\":\"Semi-Concrete\",\"estimated_value\":\"500000\",\"year_built\":\"2023\"}', NULL, NULL, NULL, '2026-06-08 12:24:06', NULL, '2026-06-08 12:23:52', '2026-06-08 12:40:30'),
(3, 2, 5, 'BGI-P-2026-66856', 'policy', 'approved', '{\"business_nature\":\"Payment Center\",\"business_location\":\"Daraga, Albay\",\"coverage_limit\":\"120000\",\"num_employees\":\"6\"}', NULL, NULL, NULL, '2026-06-08 15:10:12', '2026-06-08 15:11:04', '2026-06-08 15:09:43', '2026-06-08 15:11:04'),
(5, 2, 5, 'BGI-C-2026-50127', 'claim', 'cancelled', '{\"related_policy_ref\":\"BGI-P-2026-66856\"}', NULL, NULL, NULL, '2026-06-08 15:35:09', NULL, '2026-06-08 15:34:25', '2026-06-08 15:36:35');

-- --------------------------------------------------------

--
-- Table structure for table `calendar_tasks`
--

CREATE TABLE `calendar_tasks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `admin_id` bigint(20) UNSIGNED NOT NULL,
  `application_id` bigint(20) UNSIGNED DEFAULT NULL,
  `client_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `priority` enum('high','medium','low') NOT NULL DEFAULT 'medium',
  `status` enum('pending','in_progress','done') NOT NULL DEFAULT 'pending',
  `task_type` enum('document_review','policy_issuance','claim_processing','message_reply','other') NOT NULL DEFAULT 'other',
  `due_date` date NOT NULL,
  `due_time` time DEFAULT NULL,
  `is_checked` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `calendar_tasks`
--

INSERT INTO `calendar_tasks` (`id`, `admin_id`, `application_id`, `client_id`, `title`, `description`, `priority`, `status`, `task_type`, `due_date`, `due_time`, `is_checked`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 'Follow up: BGI-P-2026-17486', 'Awaiting additional documents from client.', 'medium', 'pending', 'document_review', '2026-06-11', NULL, 0, '2026-06-08 12:40:30', '2026-06-08 12:41:01'),
(3, 1, 5, 2, 'Need follow-up for additional requirements.', NULL, 'high', 'pending', 'message_reply', '2026-06-15', NULL, 0, '2026-06-08 16:05:42', '2026-06-08 16:05:42');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `application_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `document_type` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `stored_filename` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `file_size` int(11) NOT NULL,
  `status` enum('pending','ai_reviewed','approved','rejected','needs_resubmission') NOT NULL DEFAULT 'pending',
  `ai_validation_result` text DEFAULT NULL,
  `admin_feedback` text DEFAULT NULL,
  `ai_reviewed_at` timestamp NULL DEFAULT NULL,
  `admin_reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `application_id`, `user_id`, `document_type`, `original_filename`, `stored_filename`, `file_path`, `mime_type`, `file_size`, `status`, `ai_validation_result`, `admin_feedback`, `ai_reviewed_at`, `admin_reviewed_at`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'Duly accomplished claim form', 'Apin.Marco.Niones.PD1.Business.Processes.png', '72ea96b1-fb84-444c-9a30-284a06d61cab.png', 'documents/1/72ea96b1-fb84-444c-9a30-284a06d61cab.png', 'image/png', 29873, 'rejected', NULL, 'Please upload a scanned copy.', NULL, '2026-06-08 12:40:07', '2026-06-08 12:29:10', '2026-06-08 12:40:07'),
(3, 1, 2, 'Copy of insurance policy', 'Application-for-Scholarship.pdf', 'dca3fb0f-8b06-47f2-bda7-4f22b524a044.pdf', 'documents/1/dca3fb0f-8b06-47f2-bda7-4f22b524a044.pdf', 'application/pdf', 2785616, 'approved', NULL, 'Document approved.', NULL, '2026-06-08 14:49:06', '2026-06-08 12:35:22', '2026-06-08 14:49:06'),
(4, 1, 2, 'Photos of damaged property', 'Applaydu_Screenshot0.jpg', 'ed0be749-2b8f-4d27-8fb8-763e4338315d.jpg', 'documents/1/ed0be749-2b8f-4d27-8fb8-763e4338315d.jpg', 'image/jpeg', 1124177, 'pending', NULL, NULL, NULL, NULL, '2026-06-08 14:41:04', '2026-06-08 14:41:04'),
(5, 1, 2, 'Other Document', 'Applaydu_Screenshot3.jpg', '19841200-e7ec-4106-ae8b-c884662ed2e5.jpg', 'documents/1/19841200-e7ec-4106-ae8b-c884662ed2e5.jpg', 'image/jpeg', 1066941, 'pending', NULL, NULL, NULL, NULL, '2026-06-08 15:07:20', '2026-06-08 15:07:20'),
(6, 3, 2, 'Duly accomplished claim form', 'BethelGen_Workflow.pdf', '76bcd95f-935b-4e6a-b477-2f35589300b6.pdf', 'documents/3/76bcd95f-935b-4e6a-b477-2f35589300b6.pdf', 'application/pdf', 6911, 'pending', NULL, NULL, NULL, NULL, '2026-06-08 15:27:08', '2026-06-08 15:27:08');

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`id`, `question`, `answer`, `product_id`, `order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'What is non-life insurance?', 'Non-life insurance covers financial losses arising from specific events or accidents — such as fire, vehicular accidents, theft, and natural disasters — for a defined period (usually one year). Unlike life insurance, it does not involve a life benefit.', NULL, 0, 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(2, 'How do I get a quote?', 'You can get an initial quote by clicking the \"Get a Quote\" button on our landing page, filling out your basic information and property details. Our branch staff will then reach out to finalize your premium computation.', NULL, 0, 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(3, 'What documents do I need to submit for a policy application?', 'Required documents vary per product. Once you start your application in the portal, the system will show you the specific list of documents needed. You can upload them directly here.', NULL, 0, 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(4, 'How long does the policy processing take?', 'Processing typically takes 3-5 business days after complete document submission. You will receive real-time notifications on your application status through this portal.', NULL, 0, 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(5, 'How do I file a claim?', 'Go to the Application tab, click \"New Application,\" and select \"Claim.\" Fill out the claim details and upload the required documents. Our branch will review and contact you within 2-3 business days.', NULL, 0, 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(6, 'What is CTPL?', 'Compulsory Third Party Liability (CTPL) is a mandatory insurance for all motor vehicles registered in the Philippines. It covers bodily injury or death to third parties caused by the insured vehicle.', NULL, 0, 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(7, 'Can I renew my policy through this portal?', 'Yes. When your policy is nearing expiration, the system will notify you and you can initiate renewal directly through your portal by starting a new application for the same product.', NULL, 0, 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(8, 'What file formats are accepted for document uploads?', 'We accept PDF, JPG, JPEG, and PNG files. Each file should not exceed 10MB. Make sure documents are clear and all text is legible before uploading.', NULL, 0, 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(9, 'Who can I contact for urgent concerns?', 'You can send us a message directly through the messaging feature in this portal. For urgent matters, you may also call our Legazpi Branch at (+63)927-290-4397 or email us at damanzanillojr@bethelgen.com.', NULL, 0, 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(10, 'Is my personal information safe?', 'Yes. All your personal information and uploaded documents are encrypted and stored securely. We comply with the Data Privacy Act of 2012 (RA 10173) and our privacy policy. Your data will never be shared with third parties without your consent.', NULL, 0, 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `thread_id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `body` text NOT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  `attachment_name` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `thread_id`, `sender_id`, `body`, `attachment_path`, `attachment_name`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'good evening', NULL, NULL, 0, NULL, '2026-06-08 13:06:16', '2026-06-08 13:06:16'),
(2, 2, 2, 'good evening', NULL, NULL, 0, NULL, '2026-06-08 13:06:18', '2026-06-08 13:06:18'),
(3, 2, 1, 'good evening po. ano pong concern nyo, sir?', NULL, NULL, 0, NULL, '2026-06-08 13:08:27', '2026-06-08 13:08:27'),
(4, 2, 2, 'about the application form po...', NULL, NULL, 0, NULL, '2026-06-08 13:09:33', '2026-06-08 13:09:33'),
(5, 2, 2, 'meron po ba kayong copy?', NULL, NULL, 0, NULL, '2026-06-08 13:09:49', '2026-06-08 13:09:49'),
(6, 2, 1, 'pwede nyo po i-download sa website, sir', NULL, NULL, 0, NULL, '2026-06-08 13:16:00', '2026-06-08 13:16:00'),
(7, 2, 2, 'okay po', NULL, NULL, 0, NULL, '2026-06-08 13:16:31', '2026-06-08 13:16:31'),
(8, 2, 2, 'thank you', NULL, NULL, 0, NULL, '2026-06-08 13:16:44', '2026-06-08 13:16:44'),
(9, 2, 1, 'no problem po', NULL, NULL, 0, NULL, '2026-06-08 13:21:10', '2026-06-08 13:21:10'),
(10, 2, 2, 'tnx', NULL, NULL, 0, NULL, '2026-06-08 13:21:21', '2026-06-08 13:21:21'),
(11, 2, 2, 'tryyyy', NULL, NULL, 0, NULL, '2026-06-08 13:23:36', '2026-06-08 13:23:36'),
(12, 2, 1, 'hello', NULL, NULL, 0, NULL, '2026-06-08 13:23:49', '2026-06-08 13:23:49'),
(13, 2, 1, 'try again', NULL, NULL, 0, NULL, '2026-06-08 13:29:07', '2026-06-08 13:29:07'),
(14, 2, 2, 'okay pkay okayyy', NULL, NULL, 0, NULL, '2026-06-08 13:29:19', '2026-06-08 13:29:19'),
(15, 2, 1, 'whyy', NULL, NULL, 0, NULL, '2026-06-08 13:29:34', '2026-06-08 13:29:34'),
(16, 2, 2, 'hello', NULL, NULL, 0, NULL, '2026-06-08 13:29:48', '2026-06-08 13:29:48'),
(17, 2, 2, 'amirah', NULL, NULL, 0, NULL, '2026-06-08 13:36:41', '2026-06-08 13:36:41'),
(18, 2, 2, 'hello', NULL, NULL, 0, NULL, '2026-06-08 13:36:50', '2026-06-08 13:36:50'),
(19, 3, 3, 'hello po!', NULL, NULL, 0, NULL, '2026-06-08 15:40:11', '2026-06-08 15:40:11');

-- --------------------------------------------------------

--
-- Table structure for table `message_threads`
--

CREATE TABLE `message_threads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `application_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `client_has_unread` tinyint(1) NOT NULL DEFAULT 0,
  `admin_has_unread` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `message_threads`
--

INSERT INTO `message_threads` (`id`, `client_id`, `application_id`, `subject`, `last_message_at`, `client_has_unread`, `admin_has_unread`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, 'Client Inquiry', '2026-06-08 13:06:16', 0, 0, '2026-06-08 13:06:16', '2026-06-08 13:10:04'),
(2, 2, NULL, 'Client Inquiry', '2026-06-08 13:36:50', 0, 0, '2026-06-08 13:06:18', '2026-06-08 13:56:39'),
(3, 3, NULL, 'Client Inquiry', '2026-06-08 15:40:11', 0, 0, '2026-06-08 15:40:11', '2026-06-08 15:40:22');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(2, '2024_01_01_000001_create_users_table', 1),
(3, '2024_01_01_000002_create_applications_table', 1),
(4, '2024_01_01_000003_create_messages_calendar_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications_log`
--

CREATE TABLE `notifications_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'info',
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications_log`
--

INSERT INTO `notifications_log` (`id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 1, 'New Application Submitted', 'Juan Dela Cruz submitted application BGI-P-2026-17486', 'info', '/admin/applications/1', 1, '2026-06-08 12:24:06', '2026-06-08 12:41:22'),
(2, 2, 'Document Rejected', 'Your document \"Duly accomplished claim form\" was rejected. Reason: Please upload a scanned copy.', 'error', '/client/applications/1', 1, '2026-06-08 12:40:07', '2026-06-08 12:55:14'),
(3, 2, 'Application Status Updated', 'Your application BGI-P-2026-17486 requires additional documents.', 'info', '/client/applications/1', 1, '2026-06-08 12:40:30', '2026-06-08 12:55:12'),
(4, 2, 'New Message from Bethel Gen', 'You have a new message from the branch.', 'info', '/client/messages', 1, '2026-06-08 13:08:27', '2026-06-08 13:09:02'),
(5, 2, 'New Message from Bethel Gen', 'You have a new message from the branch.', 'info', '/client/messages', 1, '2026-06-08 13:16:00', '2026-06-08 13:20:23'),
(6, 2, 'New Message from Bethel Gen', 'You have a new message from the branch.', 'info', '/client/messages', 1, '2026-06-08 13:21:10', '2026-06-08 14:39:37'),
(7, 2, 'New Message from Bethel Gen', 'You have a new message from the branch.', 'info', '/client/messages', 1, '2026-06-08 13:23:49', '2026-06-08 14:39:37'),
(8, 2, 'New Message from Bethel Gen', 'You have a new message from the branch.', 'info', '/client/messages', 1, '2026-06-08 13:29:07', '2026-06-08 14:39:37'),
(9, 2, 'New Message from Bethel Gen', 'You have a new message from the branch.', 'info', '/client/messages', 1, '2026-06-08 13:29:34', '2026-06-08 14:45:39'),
(10, 2, 'Document Approved', 'Your document \"Copy of insurance policy\" for application BGI-P-2026-17486 has been approved.', 'success', '/client/applications/1', 1, '2026-06-08 14:49:06', '2026-06-08 15:04:02'),
(11, 1, 'New Application Submitted', 'Juan Dela Cruz submitted application BGI-P-2026-66856', 'info', '/admin/applications/3', 1, '2026-06-08 15:10:12', '2026-06-08 15:27:41'),
(12, 2, 'Application Status Updated', 'Your application BGI-P-2026-66856 has been APPROVED.', 'success', '/client/applications/3', 1, '2026-06-08 15:11:04', '2026-06-08 15:11:32'),
(13, 1, 'New Application Submitted', 'Juan Dela Cruz submitted application BGI-C-2026-50127', 'info', '/admin/applications/5', 1, '2026-06-08 15:35:09', '2026-06-08 15:35:24'),
(14, 2, 'Application Status Updated', 'Your application BGI-C-2026-50127 has been cancelled.', 'info', '/client/applications/5', 1, '2026-06-08 15:36:35', '2026-06-08 15:36:42');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(10, 'App\\Models\\User', 3, 'auth_token', 'a0209e384031aa99eef1d7662792ce1dd4dca17c53af3b7aed05b77f525fc265', '[\"*\"]', '2026-06-08 16:56:51', NULL, '2026-06-08 16:24:39', '2026-06-08 16:56:51'),
(11, 'App\\Models\\User', 1, 'auth_token', '3b1e4b67e49006590d5503c22028000948ded20d35e3b88c51821b7e2113f7d1', '[\"*\"]', '2026-06-08 16:57:13', NULL, '2026-06-08 16:49:18', '2026-06-08 16:57:13');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `required_documents` text NOT NULL,
  `basic_info_fields` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `required_documents`, `basic_info_fields`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Fire Insurance', 'fire', 'Protects homeowners, building owners, and tenants against fire and allied perils including earthquake, typhoon, and flood.', '\"[\\\"Duly accomplished claim form\\\",\\\"Copy of insurance policy\\\",\\\"Fire department report \\\\\\/ Police report\\\",\\\"Photos of damaged property\\\",\\\"Inventory list of damaged items\\\",\\\"Proof of ownership or lease agreement\\\"]\"', '\"[{\\\"key\\\":\\\"property_type\\\",\\\"label\\\":\\\"Property Type\\\",\\\"type\\\":\\\"select\\\",\\\"options\\\":[\\\"Residential\\\",\\\"Commercial\\\",\\\"Industrial\\\"]},{\\\"key\\\":\\\"property_address\\\",\\\"label\\\":\\\"Property Address\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"construction_type\\\",\\\"label\\\":\\\"Construction Type\\\",\\\"type\\\":\\\"select\\\",\\\"options\\\":[\\\"Concrete\\\",\\\"Semi-Concrete\\\",\\\"Wood\\\",\\\"Mixed\\\"]},{\\\"key\\\":\\\"estimated_value\\\",\\\"label\\\":\\\"Estimated Property Value (PHP)\\\",\\\"type\\\":\\\"number\\\"},{\\\"key\\\":\\\"year_built\\\",\\\"label\\\":\\\"Year Built\\\",\\\"type\\\":\\\"number\\\"}]\"', 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(2, 'Motor Car Insurance', 'motor', 'Indemnifies the insured against loss, damage or liability arising from motor vehicle accidents including theft and third-party liability.', '\"[\\\"Duly accomplished claim form\\\",\\\"Copy of insurance policy\\\",\\\"Official Receipt (OR) and Certificate of Registration (CR)\\\",\\\"Driver\'s License of driver involved\\\",\\\"Police \\\\\\/ Traffic report\\\",\\\"Photos of damaged vehicle\\\",\\\"Repair estimate from accredited shop\\\"]\"', '\"[{\\\"key\\\":\\\"vehicle_make\\\",\\\"label\\\":\\\"Vehicle Make\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"vehicle_model\\\",\\\"label\\\":\\\"Vehicle Model\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"vehicle_year\\\",\\\"label\\\":\\\"Year Model\\\",\\\"type\\\":\\\"number\\\"},{\\\"key\\\":\\\"plate_number\\\",\\\"label\\\":\\\"Plate Number\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"chassis_number\\\",\\\"label\\\":\\\"Chassis Number\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"market_value\\\",\\\"label\\\":\\\"Current Market Value (PHP)\\\",\\\"type\\\":\\\"number\\\"},{\\\"key\\\":\\\"coverage_type\\\",\\\"label\\\":\\\"Coverage Type\\\",\\\"type\\\":\\\"select\\\",\\\"options\\\":[\\\"CTPL Only\\\",\\\"Comprehensive\\\",\\\"Acts of God\\\"]}]\"', 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(3, 'Marine Insurance', 'marine', 'Covers physical loss or damage on goods, property or merchandise in transit whether by sea, land, or air.', '\"[\\\"Duly accomplished claim form\\\",\\\"Copy of insurance policy \\\\\\/ certificate\\\",\\\"Bill of lading \\\\\\/ Airway bill\\\",\\\"Commercial invoice and packing list\\\",\\\"Survey report\\\",\\\"Photos of damaged cargo\\\"]\"', '\"[{\\\"key\\\":\\\"cargo_type\\\",\\\"label\\\":\\\"Type of Cargo\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"cargo_value\\\",\\\"label\\\":\\\"Cargo Value (PHP)\\\",\\\"type\\\":\\\"number\\\"},{\\\"key\\\":\\\"origin\\\",\\\"label\\\":\\\"Port of Origin\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"destination\\\",\\\"label\\\":\\\"Port of Destination\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"transport_mode\\\",\\\"label\\\":\\\"Mode of Transport\\\",\\\"type\\\":\\\"select\\\",\\\"options\\\":[\\\"Sea\\\",\\\"Air\\\",\\\"Land\\\"]}]\"', 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(4, 'Engineering Insurance', 'engineering', 'Covers construction projects, civil works, and machinery against unforeseen physical damage.', '\"[\\\"Duly accomplished claim form\\\",\\\"Copy of insurance policy\\\",\\\"Project documents \\\\\\/ contract\\\",\\\"Technical report on damage\\\",\\\"Photos of damaged works\\\\\\/equipment\\\",\\\"Repair or replacement cost estimate\\\"]\"', '\"[{\\\"key\\\":\\\"project_name\\\",\\\"label\\\":\\\"Project Name\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"project_location\\\",\\\"label\\\":\\\"Project Location\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"contract_value\\\",\\\"label\\\":\\\"Contract Value (PHP)\\\",\\\"type\\\":\\\"number\\\"},{\\\"key\\\":\\\"project_duration\\\",\\\"label\\\":\\\"Project Duration (months)\\\",\\\"type\\\":\\\"number\\\"},{\\\"key\\\":\\\"coverage_type\\\",\\\"label\\\":\\\"Coverage Type\\\",\\\"type\\\":\\\"select\\\",\\\"options\\\":[\\\"Construction All Risks\\\",\\\"Erection All Risks\\\",\\\"Machinery Breakdown\\\",\\\"Contractors Plant & Equipment\\\"]}]\"', 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(5, 'Casualty Insurance', 'casualty', 'Protects the insured against legal liability to third parties for bodily injury and property damage.', '\"[\\\"Duly accomplished claim form\\\",\\\"Copy of insurance policy\\\",\\\"Police or incident report\\\",\\\"Medical certificates \\\\\\/ hospital bills (if bodily injury)\\\",\\\"Photos of incident\\\",\\\"Demand letter from claimant (if any)\\\"]\"', '\"[{\\\"key\\\":\\\"business_nature\\\",\\\"label\\\":\\\"Nature of Business \\\\\\/ Activity\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"business_location\\\",\\\"label\\\":\\\"Business Location\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"coverage_limit\\\",\\\"label\\\":\\\"Desired Coverage Limit (PHP)\\\",\\\"type\\\":\\\"number\\\"},{\\\"key\\\":\\\"num_employees\\\",\\\"label\\\":\\\"Number of Employees\\\",\\\"type\\\":\\\"number\\\"}]\"', 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(6, 'Bonds', 'bonds', 'Surety bonds for contractors, supply and delivery, and other obligations guaranteeing faithful performance.', '\"[\\\"Duly accomplished application form\\\",\\\"Copy of contract \\\\\\/ agreement\\\",\\\"Financial statements (latest 3 years)\\\",\\\"ITR (Income Tax Return)\\\",\\\"Business permits and licenses\\\",\\\"List of completed and ongoing projects\\\"]\"', '\"[{\\\"key\\\":\\\"bond_type\\\",\\\"label\\\":\\\"Type of Bond\\\",\\\"type\\\":\\\"select\\\",\\\"options\\\":[\\\"Bid Bond\\\",\\\"Performance Bond\\\",\\\"Payment Bond\\\",\\\"Maintenance Bond\\\",\\\"Supply Bond\\\"]},{\\\"key\\\":\\\"principal_name\\\",\\\"label\\\":\\\"Principal \\\\\\/ Contractor Name\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"obligee\\\",\\\"label\\\":\\\"Obligee (Beneficiary)\\\",\\\"type\\\":\\\"text\\\"},{\\\"key\\\":\\\"bond_amount\\\",\\\"label\\\":\\\"Bond Amount (PHP)\\\",\\\"type\\\":\\\"number\\\"},{\\\"key\\\":\\\"project_description\\\",\\\"label\\\":\\\"Project Description\\\",\\\"type\\\":\\\"text\\\"}]\"', 1, '2026-06-08 11:35:46', '2026-06-08 11:35:46');

-- --------------------------------------------------------

--
-- Table structure for table `quotes`
--

CREATE TABLE `quotes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `property_details` text NOT NULL,
  `estimated_premium` decimal(12,2) DEFAULT NULL,
  `status` enum('pending','converted','declined') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quotes`
--

INSERT INTO `quotes` (`id`, `full_name`, `email`, `phone`, `product_id`, `property_details`, `estimated_premium`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Maria Dimaguiba', 'mary@gmail.com', '09765463464', 2, '{\"vehicle_make\":\"Toyota\",\"vehicle_model\":\"Vios\",\"vehicle_year\":\"2025\",\"plate_number\":\"GXS-4567\",\"chassis_number\":\"45678\",\"market_value\":\"450000\",\"coverage_type\":\"CTPL Only\"}', NULL, 'pending', '2026-06-08 12:20:49', '2026-06-08 12:20:49'),
(2, 'Kim Apin', 'kimberlyapin6@gmail.com', '09124567890', 1, '{\"property_type\":\"Residential\",\"property_address\":\"Cabangan, Legazpi City\",\"construction_type\":\"Mixed\",\"estimated_value\":\"450000\",\"year_built\":\"2015\"}', NULL, 'pending', '2026-06-08 13:54:45', '2026-06-08 13:54:45');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','client') NOT NULL DEFAULT 'client',
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `email_verified_at`, `password`, `role`, `phone`, `address`, `birthdate`, `gender`, `photo`, `reset_token`, `reset_token_expires_at`, `is_active`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Branch', 'Admin', 'admin@bethelgen.com', NULL, '$2y$12$WJWwU9Lla10qiDQ3Srb2hetBhmRXmUphZRanU0sgILYv2yvaR0DFy', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2026-06-08 11:35:45', '2026-06-08 11:35:45'),
(2, 'Juan', 'Dela Cruz', 'juan@gmail.com', NULL, '$2y$12$W/W/PMxqNZDtbOSJSW0ubehIspiPKm5rAdbNXhRNlbfVLlq6hMEKi', 'client', '09171234567', 'Legazpi City, Albay', NULL, NULL, NULL, NULL, NULL, 1, NULL, '2026-06-08 11:35:46', '2026-06-08 11:35:46'),
(3, 'Marjorie', 'Marco', 'rierie@gmail.com', NULL, '$2y$12$I/K09fB4nnZr8A3YNvvDFu/YYFaTUFfT6YXzGnvnDDDA77oV7CLqy', 'client', '09127654789', 'Daraga, Albay', '2004-04-27', 'female', NULL, NULL, NULL, 1, NULL, '2026-06-08 15:39:47', '2026-06-08 15:39:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `applications_reference_number_unique` (`reference_number`),
  ADD KEY `applications_user_id_foreign` (`user_id`),
  ADD KEY `applications_product_id_foreign` (`product_id`);

--
-- Indexes for table `calendar_tasks`
--
ALTER TABLE `calendar_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `calendar_tasks_admin_id_foreign` (`admin_id`),
  ADD KEY `calendar_tasks_application_id_foreign` (`application_id`),
  ADD KEY `calendar_tasks_client_id_foreign` (`client_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `documents_application_id_foreign` (`application_id`),
  ADD KEY `documents_user_id_foreign` (`user_id`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `faqs_product_id_foreign` (`product_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_thread_id_foreign` (`thread_id`),
  ADD KEY `messages_sender_id_foreign` (`sender_id`);

--
-- Indexes for table `message_threads`
--
ALTER TABLE `message_threads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `message_threads_client_id_foreign` (`client_id`),
  ADD KEY `message_threads_application_id_foreign` (`application_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications_log`
--
ALTER TABLE `notifications_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_log_user_id_foreign` (`user_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`);

--
-- Indexes for table `quotes`
--
ALTER TABLE `quotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotes_product_id_foreign` (`product_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `calendar_tasks`
--
ALTER TABLE `calendar_tasks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `message_threads`
--
ALTER TABLE `message_threads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications_log`
--
ALTER TABLE `notifications_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `quotes`
--
ALTER TABLE `quotes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `applications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `calendar_tasks`
--
ALTER TABLE `calendar_tasks`
  ADD CONSTRAINT `calendar_tasks_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `calendar_tasks_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `calendar_tasks_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `documents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `faqs`
--
ALTER TABLE `faqs`
  ADD CONSTRAINT `faqs_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_thread_id_foreign` FOREIGN KEY (`thread_id`) REFERENCES `message_threads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message_threads`
--
ALTER TABLE `message_threads`
  ADD CONSTRAINT `message_threads_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `message_threads_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications_log`
--
ALTER TABLE `notifications_log`
  ADD CONSTRAINT `notifications_log_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quotes`
--
ALTER TABLE `quotes`
  ADD CONSTRAINT `quotes_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
