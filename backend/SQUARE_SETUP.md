# Square Payment Setup Instructions

## Step 1: Create .env file

Create a file named `.env` in the `backend/` folder with the following content:

```
# Square Payment Configuration
SQUARE_ACCESS_TOKEN=EAAAlzhoDf6KmCAYOtb_PvjFjBxPpgvq
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=MONG-7jXIE1WgV33Pahj7wXEiU4cmxo
SQUARE_APPLICATION_ID=sandbox-sqOidb-ebt4L1gL6slapkW06ou
FRONTEND_URL=http://localhost:4567
MERCHANT_EMAIL=support@elisbakery.com
```

## Step 2: Restart your backend server

After creating the .env file, restart your backend server:

```bash
npm run server
```

## Step 3: Test the payment flow

1. Go to your order page
2. Fill out a test order
3. Click "Proceed to Payment"
4. You should be redirected to Square's checkout page

## Notes

- The system will automatically fall back to mock mode if Square credentials are not configured
- Make sure your `.env` file is in the `backend/` folder
- Never commit the `.env` file to git (it should be in .gitignore)

