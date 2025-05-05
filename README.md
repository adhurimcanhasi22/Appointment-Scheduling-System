# 15. Appoint Management System
# Medical Clinic Appointment System

**Streamlining Healthcare Scheduling**

## Project Overview

This project provides a platform for managing and scheduling appointments, specifically tailored for a medical clinic environment.  The system is designed with a microservices architecture to ensure scalability and maintainability. It enables patients to book appointments, healthcare providers to manage their availability, and facilitates communication through notifications.

## Microservices and Technologies

The system is composed of the following microservices, built using Node.js and related technologies:

* **User Service (Node.js, Express.js):**
    * Manages patient and provider accounts, authentication, and authorization.
    * Technology: Node.js, Express.js, Supabase (for database).
* **Schedule Service (Node.js, Express.js):**
    * Handles appointment scheduling logic, including availability management and booking.
    * Technology: Node.js, Express.js, Supabase (for database).
* **Notification Service (Node.js):**
    * Manages appointment reminders and updates.
    * Technology: Node.js.

## Project Architecture

+------------------------+|        Client          ||                        ||    +--------------+    ||    |  Web Browser  |    ||    +--------------+    ||                        |+------------------------+^| (HTTPS)+------------------------+|     API Gateway      |  (Node.js, Express)| (Kong/Express Proxy) |+------------------------+|+---+---+|       |+--------+  +--------+  +-----------------+| User   |  | Schedule|  | Notification    || Service|  | Service |  | Service         ||(Node.js)|  |(Node.js)|  |(Node.js)       |+--------+  +--------+  +-----------------+|       |       |+--------+  +--------+  +--------+| User DB|  |Schedule|  |Notification||(Supabase)|  |DB      |  |DB        |+--------+  +--------+  +--------+(Supabase)    (Supabase)    (Supabase)
## Technology Stack

* **Frontend:**
    * React
    * TypeScript
    * React Router
* **Backend:**
    * Node.js
    * Express.js
* **Database:**
    * Supabase (PostgreSQL)
* **Communication:**
    * RESTful APIs
    * JSON
* **API Gateway:**
    * Node.js with Express.js

## Features

* Patient appointment booking
* Provider schedule management
* Appointment reminders and updates
* Calendar Integration (Optional)
