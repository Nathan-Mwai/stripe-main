const express = require("express");
const app = express();
const { resolve } = require("path");
const env = require("dotenv").config({ path: "./.env" });
const cors = require("cors");

app.use(express.json());

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


app.use(cors({
    origin: "*",
}));

app.get("/config", (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

app.get("/", (req, res) => {
    res.send("Stripe");

})

app.post("/create-payment-intent", async (req, res) => {
    const { amount } = req.body;

    const amountNum = Number(amount);

    if (!amountNum) {
        return res.status(400).send({ error: "Amount is required" });
    }

    if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).send({ error: "Amount must be a positive number" });
    }


    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountNum,
            currency: "kes",
            automatic_payment_methods: { enabled: true },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (e) {
        console.error("Stripe error:", e);
        res.status(400).send({ error: { message: e.message } });
    }
});


// app.post("/create-payment-intent", async (req, res) => {
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       currency: "EUR",
//       amount: 1999,
//       automatic_payment_methods: { enabled: true },
//     });

//     // Send publishable key and PaymentIntent details to client
//     res.send({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (e) {
//     return res.status(400).send({
//       error: {
//         message: e.message,
//       },
//     });
//   }
// });

app.listen(5252, () =>
    console.log(`Node server listening at http://localhost:5252`)
);
