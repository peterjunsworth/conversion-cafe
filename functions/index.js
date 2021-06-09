const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const Base64 = require("base64-string").Base64;

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

const cors = require("cors")({origin: true});

exports.getProducts = functions.https.onRequest((req, res) => {
    cors( req, res, async () => {
        const authToken = validateHeader(req);
        if (!authToken) {
            return res.status(403).send("Unauthorized! Missing auth token!");
        }
        await admin.auth().verifyIdToken(authToken);

        console.log("QUERY: ", req.query);

        if (!req.query.merchantId) return res.status(404).json("Requires a Merchant ID!");

        const merchant = await db.collection("merchants").doc(req.query.merchantId).get();

        if (!merchant.exists) {
            return res.status(404).json("No Merchant with that ID!");
        } else {
            const merchantData = merchant.data();
            if (merchantData.apiKey && merchantData.apiSecret && merchantData.name) {
                const axiosUrl = "https://" + merchantData.name + ".myshopify.com/admin/api/2021-04/products.json";
                console.log("axiosUrl: ", axiosUrl);
                const encoding = new Base64();
                const encodedAuth = encoding.urlEncode(merchantData.apiKey + ":" + merchantData.apiSecret);
                const headers = {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Authorization": "Basic " + encodedAuth,
                        "Content-Type": "application/json",
                    },
                };
                return axios.get(axiosUrl, headers)
                    .then((response) => {
                        console.log("DATA: ", response.data);
                        return res.status(200).json({
                            message: response.data,
                        });
                    }).catch((err) => {
                        return res.status(500).json({
                            error: err,
                        });
                    });
            }
        }
    });
});


/**
 * @param {object} req The request object
 * @return {Array} Authorization header values
 */
function validateHeader(req) {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        console.log("auth header found");
        return req.headers.authorization.split("Bearer ")[1];
    }
}
