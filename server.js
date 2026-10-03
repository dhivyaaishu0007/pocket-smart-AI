require("dotenv").config(
    {override: true});

const http = require("http");
const fs = require("fs");
const OpenAI = require("openai");
const { config } = require("dotenv");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const server = http.createServer(async (req, res) => {

    // Open website
    if (req.method === "GET" && req.url === "/") {
        const html = fs.readFileSync("index.html", "utf8");

        res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });

        res.end(html);
        return;
    }

    // Ask AI
    if (req.method === "POST" && req.url === "/api/chat") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {

            try {
                const data = JSON.parse(body);

                const response = await client.responses.create({
                    model: "gpt-6-luna",
                    input: data.question
                });

                res.writeHead(200, {
                    "Content-Type": "application/json; charset=utf-8"
                });

                res.end(JSON.stringify({
                    answer: response.output_text
                }));

            } catch (error) {

                console.error(error);

                res.writeHead(500, {
                    "Content-Type": "application/json; charset=utf-8"
                });

                res.end(JSON.stringify({
                    error: "AI request failed"
                }));
            }
        });

        return;
    }

    res.writeHead(404);
    res.end("Not found");
});

server.listen(3000, () => {
    console.log("PocketSmart AI running at http://localhost:3000");
});