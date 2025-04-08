For the dashboard we need,

- Kor_coin total balance
- New customers data
- Activity points total
- Using Kor_coins : HOw can we do this ? That's the big question.
  - So we need to track the usage of the kor_coins.
- New sign ups daily data needed (24 hours)
- Total registered users data needed.
- Daily UID registration.
  - Why do we need this UID ? What's the purpose of this UID?
- Trading Volume
  - How are we calculating this trading volume ? again the big question.
- So we need kor_coin acitivity: SO is it daily activity ? or how is it ?
- New User sign ups

Next is the Notifications and alerts for the admins.

- All Notifications first needed.
- Kor_coin withdrawal alerts as well as deposit and credit alerts for approve the kor_coin payments.
- Next is new user sign ups alerts and any regardign the uses.
- Next is the the reports. SO the daily reports will be alerted to the admins.
- System alerts if there is anything update, new version or any issues with the system will be alerted to the admins.

User Management

- User Name : First Name + Last Name
- UID (Now do we need this or not what's the purpose of this UID)
- Status (Active, Pending, Inactive, Suspended) By default all the users are active. For the pending users we need to make sure user is verified. For the inactive users we need to make sure user is alerted regarding this inactivity. And for the suspended will be based on the how many warnings the user has received.
- Warnings (How many times the user has been warned) by default all users will have 0 warnings but eventually we need to make sure the users are warned when they are suspicious.
- Kor_coin balance of the every user.
- Registered date: When was the user registered.
- Last login date: When was the user last logged in.

Activity Log :
This will be admin acitivity log.

- There will be timestamp for the activity when the admin did this activity.
- Action: What action does exactly admin did.
- Admin: Who exactly did this activity.
- Target: Who's the target user for this activity.
- Details: What's the details of this activity. What exactly did the admin did.
- Severity: How serious is this activity. (High, Medium, Low or Critical)

Kor_Coin admin dashboard

- Deposit Management:
- ID : Deposit ID we need
- User: Which user did this deposit display the user name.
- Amount (in kor_coin): How much kor_coin did the user deposit.
- Payment Method: What payment method did the user use for this deposit. Is it bank transfer or credit card.
- Status: What is the status of this deposit (Pending, Completed, Failed, Rejected). Did admin approve or reject this deposit.
- Date: When did this deposit happen.
- Approved by : Who approved this deposit. Admin name need to display.

- Withdrawal Management:
- ID : Withdrawal ID we need
- User: Which user did this withdrawal display the user name.
- Amount (in kor_coin): How much kor_coin did the user withdraw.
- Payment Method: What payment method did the user use for this withdrawal.
- Status: What is the status of this withdrawal (Pending, Completed, Failed, Rejected).
- Date: When did this withdrawal happen.
- Approved by : Who approved this withdrawal. Admin name need to display.

Activity Management

- Id for the activity
- User : Who did this activity
- Earned Points: How many points did the user earn from this activity.
- Activity Type: What type of activity did the user do.
- Content: What was the content of the activity.
- Date & Time: When did this activity happen.

Usage History:

- ID : Usage ID we need
- User: Which user did this usage display the user name.
- Amount used (in kor_coin): How much kor_coin did the user use.
- Usage Type: What type of usage did the user do (Is it for buying or selling or subscribition or any other usage).
- Items/donations: What was the item/donation name for this usage.
- Date & Time: When did this usage happen.

UID Management:

- ID : UID ID we need
- User: Which user did this UID display the user name.
- Nickname: What is the nickname of the user.
- Exchange: What is the exchange of the user (BTC, ETH, LTC, etc).
- Status: Is it verified, pending or rejected.
- Registration Date: When did this UID registration happen.
- Approved by : Who approved this UID registration (admin name need to display).

Exchange UID Management:

- Name : Name of the user who started the exchange.
- UID : Exchange UID needed.
- Exchange : Exchange name (BTC, ETH, LTC, etc).
- Phone number: Phone number of the user.
- Email: Email of the user.
- Registration Date: When did this UID registration happen.
- Situation: What is the situation of this UID (Is it verified, pending or rejected).

Managing the Posts:

- Title of the post
- Author: Who wrote this post.
- Category: What's the cateogory of this post.
- Status: What's the status of this post (Published, Draft, Deleted, Hidden).
- Views: How many times this post was viewed.
- Comments: How many comments this post has.
- Likes: How many likes this post has.
- Date & Time: When did this post happen.

URL Management:

- What's this URL Management is about.

Administration Notes:

- Who can send the administration notes. Because i think only super_admins can send the notes. That would be good. And any other admins will come under the super_admins. Like basically all the admins will be under the super_admins.

Administration Settings:

- Now this also needs to be managed by only the super_admins because i don't want to give to much power to the admins because that would be very bad.
