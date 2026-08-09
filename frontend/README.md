# Cake Delight Frontend

Simple vanilla frontend for the Cake Delight microservices capstone.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API

## API Base

All requests go through the API Gateway:

`http://localhost:8080`

## Pages

- `index.html` - Browse and search cakes
- `basket.html` - View and update basket items
- `checkout.html` - Place an order and submit ratings
- `notifications.html` - View user notifications

## Run

Open the HTML files in a browser while the API Gateway is running on port `8080`.

## Notes

- The frontend never calls services directly.
- User identity is stored in `localStorage` under `cakeDelightUserId`.
- The latest order is stored in `localStorage` under `cakeDelightLastOrder` so the rating form can appear after checkout.
