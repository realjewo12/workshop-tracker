# Software Requirements Specification (SRS)
## Project: Workshop Order-Tracking System 

---

## 1. REQUIREMENTS ANALYSIS

### 1.1 Problem Statement
Local workshops in rural towns (tailors, carpenters, welders, shoemakers, sewing ateliers) manage orders manually using notebooks. This leads to several critical business issues:
* **Lost or damaged order records:** Paper books get ruined by workshop spills, torn, or misplaced.
* **Forgotten delivery dates:** No automated tracking means deadlines slip, leading to customer dissatisfaction.
* **Lack of transparency:** No formal receipts or proof of payment are generated, causing trust gaps regarding deposits and balances.
* **Fragmented customer records:** Workshop owners have no easy way to view a customer's history or preferences.
* **Communication gaps:** Customers do not receive timely updates or pickup reminders, causing delays in item collection.

**Solution:** The community needs a simple, mobile-friendly, offline-first system to track orders, manage payments, and notify customers automatically without heavy data costs.

### 1.2 Project Goals
* **Digitize order tracking:** Replace paper logs with a reliable database system.
* **Improve communication:** Automatically keep workshops and customers in loop via SMS or WhatsApp notifications.
* **Reduce missed deadlines:** Keep critical due dates visible via dashboard alerts.
* **Provide receipts and transparency:** Instantly calculate down payments and balances with shareable digital receipts.
* **Enable customer history and analytics:** Help artisans track their top clients and monthly business revenue.
* **Support low-internet environments:** Ensure data is safe even during network drops common in rural settings.

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 User Management & Profile Setup
* **Owner Registration:** Workshop owners can create an account using their Full Name, Workshop Name, Phone Number, and a secure Password. The phone number must be validated by the system.
* **Secure Login:** Access via Phone Number and Password. The system must display clear error messages for wrong credentials. Sessions must persist securely to minimize constant re-logging.
* **Workshop Customization:** Owners can select their specific trade (e.g., Tailor, Carpenter, Welder, Shoemaker) from a dropdown list to adapt the workspace fields to their operational needs.

### 2.2 Customer Management
* **Customer Profiling:** Automatically create or link a customer record when an order is made.
* **Customer Directory:** A dedicated space to view client contact details, total money spent, and an absolute history of their past items and orders.

### 2.3 Order Management & Tracking
* **Order Entry:** Record new customer entries capturing Customer Name, Phone, Order Description, Price, Deposit Made, and Delivery Date. Every order gets an auto-generated unique ID.
* **Status Lifecycle:** Update order status seamlessly through four specific stages: `Pending` $\rightarrow$ `In Progress` $\rightarrow$ `Ready` $\rightarrow$ `Delivered`. The system must automatically stamp the exact time of any status shift.
* **Artisan Dashboard:** A centralized control layout displaying all active items. It must include filters sorting by status, date, or customer name, with bright color-coding alerting owners to overdue assignments.
* **Visual References (Optional):** Ability to snap and attach 1 to 3 reference photos to an order. Images must pass through client-side compression to prevent data drain over local cellular networks.

### 2.4 Notifications (SMS / WhatsApp)
* **Creation Alert:** Send an automatic confirmation message to the customer immediately when an order is logged, showing their Order ID, item description, and planned pickup date.
* **Ready Notification:** Trigger a direct message to the customer the moment their status is toggled to `Ready`, including the workshop name, contact number, and collection location.
* **Proactive Reminders:** System schedules an automatic reminder broadcast to the customer 24 to 48 hours prior to the official delivery deadline.

### 2.5 Receipts & Financial Controls
* **Balance Auto-Calculator:** Built-in validation that subtracts deposits from total project prices to output real-time outstanding balances.
* **Digital Receipt Generator:** Create clean, readable receipts outlining the Order ID, item list, total cost, down payment, and remaining balance. Receipts must be downloadable as a compact image or PDF format for easy sharing over WhatsApp.

### 2.6 Analytics & Reports
* **Performance Dashboard:** Provide visual micro-insights showing total orders processed per month, total revenue collected, and a list of outstanding unpaid client balances.

### 2.7 Offline-First Capability (Data Resiliency)
* **Local Workspace Storage:** The application must remain fully functional without internet access. Data entries must cache directly onto the device's local database (`IndexedDB`).
* **Background Sync Coordination:** Once an internet connection becomes stable, the system must execute an automatic background synchronization loop to update the central cloud database without disrupting the active user interface.

---

## 3. NON-FUNCTIONAL REQUIREMENTS

* **Performance:** The interface must load in under 3 seconds on low-end mobile devices and unstable networks.
* **Usability:** High-contrast, clean, text-first user interface tailored for fast interaction by users who might not be highly tech-savvy.
* **Security:** Secure authentication tokens (JWT) for session management and strict encryption hashing for all stored owner passwords.
* **Reliability:** Dual-layer storage (Local Client Cache + Cloud Database Replication) using a Last-Write-Wins (LWW) resolution rule to ensure no order data is overwritten or dropped.
* **Scalability:** The system design must handle multiple independent workshops without data leakage between business accounts.
* **Portability:** Built as a mobile-first Progressive Web App (PWA) that installs on Android devices directly from the browser, omitting heavy app store downloads.
