# 15. Appoint Management System  
# Beauty Salon Booking System  

**Simplifying Appointment Scheduling for Beauty Services**

## Project Overview

This project is a platform for managing and booking appointments, built for beauty salons.  
It uses a microservices architecture to support scalability and ease of maintenance.  
Customers can book services, salon staff can manage availability, and the system sends appointment reminders.

## Microservices and Technologies

The platform includes these microservices, built with Node.js:

- **User Service (Node.js, Express.js)**  
  - Handles customer and staff accounts, authentication, and authorization.  
  - Uses Supabase for the database.

- **Schedule Service (Node.js, Express.js)**  
  - Manages booking logic, staff availability, and service slots.  
  - Uses Supabase for the database.

- **Notification Service (Node.js)**  
  - Sends reminders and updates for upcoming appointments.  
  - Uses Supabase for the database.

## Project Architecture

+------------------------+
|        Client          |
|   +--------------+     |
|   |  Web Browser  |     |
+------------------------+
           |
        (HTTPS)
           |
+------------------------+
|      API Gateway       |
| (Node.js, Express.js)  |
+------------------------+
       |        |        |
+--------+  +--------+  +-----------------+
|  User  |  |Schedule|  |  Notification   |
|Service |  |Service |  |    Service      |
+--------+  +--------+  +-----------------+
    |           |              |
+--------+  +--------+     +--------+
| User DB|  |Schedule|     | Notify |
|Supabase|  | DB     |     |  DB    |
+--------+  +--------+     +--------+


## Technology Stack

### Frontend
- React  
- TypeScript  
- React Router  

### Backend
- Node.js  
- Express.js  

### Database
- Supabase (PostgreSQL)  

### Communication
- RESTful APIs  
- JSON  

### API Gateway
- Node.js with Express.js  

## Features

- Customer appointment booking  
- Staff schedule and service management  
- Appointment notifications and reminders  
- Optional calendar integration  
