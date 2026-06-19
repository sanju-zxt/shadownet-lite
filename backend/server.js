import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import nlp from "compromise";
import Sentiment from "sentiment";

dotenv.config();

const app = express();
const sentiment = new Sentiment();

app.use(cors());
app.use(express.json());

const SOURCE_SCORES = {
  Reuters: 95,
  BBC: 92,
  "Associated Press": 94,
  CNN: 85,
  CNBC: 88,
  Bloomberg: 96,
  Forbes: 84,
  TechCrunch: 80,
  "The Verge": 82,
  Unknown: 50
};

const NARRATIVES = {
  "AI & Innovation": [
    "ai",
    "artificial",
    "openai",
    "machine",
    "intelligence",
    "model",
    "automation",
    "technology"
  ],
  "Cyber Security": [
    "hack",
    "cyber",
    "breach",
    "attack",
    "malware",
    "ransomware",
    "security"
  ],
  "Business Growth": [
    "market",
    "stock",
    "growth",
    "revenue",
    "investor",
    "business",
    "earnings"
  ],
  "Government & Policy": [
    "government",
    "policy",
    "law",
    "regulation",
    "minister",
    "parliament"
  ]
};

app.get("/search", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({
        error: "Query required"
      });
    }

    const response = await axios.get(
      "https://newsapi.org/v2/everything",
      {
        params: {
          q: query,
          pageSize: 40,
          language: "en",
          sortBy: "publishedAt",
          apiKey: process.env.NEWS_API_KEY
        }
      }
    );

    const articles = response.data.articles || [];

    const nodes = [];
    const links = [];
    const nodeSet = new Set();

    const entityFreq = {};
    const keywordFreq = {};
    const geoFreq = {};

    const timeline = [];
    const sourceCredibility = [];

    let sentimentScore = 0;

    let narrativeScores = {
      "AI & Innovation": 0,
      "Cyber Security": 0,
      "Business Growth": 0,
      "Government & Policy": 0
    };

    articles.forEach(article => {
      const text =
        `${article.title || ""} ${article.description || ""}`;

      sentimentScore += sentiment.analyze(text).score;

      timeline.push({
        title: article.title,
        source: article.source?.name,
        publishedAt: article.publishedAt
      });

      const sourceName =
        article.source?.name || "Unknown";

      sourceCredibility.push({
        source: sourceName,
        score:
          SOURCE_SCORES[sourceName] ||
          SOURCE_SCORES.Unknown
      });

      const lowerText = text.toLowerCase();

      Object.keys(NARRATIVES).forEach(category => {
        NARRATIVES[category].forEach(keyword => {
          if (lowerText.includes(keyword)) {
            narrativeScores[category]++;
          }
        });
      });

      const doc = nlp(text);

      const entities = [
        ...doc.people().out("array"),
        ...doc.organizations().out("array"),
        ...doc.places().out("array")
      ];

      const places =
        doc.places().out("array");

      places.forEach(place => {
        geoFreq[place] =
          (geoFreq[place] || 0) + 1;
      });

      entities.forEach(entity => {

        entityFreq[entity] =
          (entityFreq[entity] || 0) + 1;

        if (!nodeSet.has(entity)) {
          nodeSet.add(entity);

          nodes.push({
            id: entity,
            mentions:
              entityFreq[entity]
          });
        }
      });

      for (
        let i = 0;
        i < entities.length;
        i++
      ) {
        for (
          let j = i + 1;
          j < entities.length;
          j++
        ) {
          links.push({
            source: entities[i],
            target: entities[j]
          });
        }
      }

      text
        .toLowerCase()
        .split(/\W+/)
        .forEach(word => {

          if (
            word.length > 5 &&
            ![
              "people",
              "system",
              "technology",
              "article",
              "information",
              "artificial",
              "intelligence"
            ].includes(word)
          ) {
            keywordFreq[word] =
              (keywordFreq[word] || 0) + 1;
          }
        });
    });

    const topEntities =
      Object.entries(entityFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const keywords =
      Object.entries(keywordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const geoRanking =
      Object.entries(geoFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const sortedNarratives =
      Object.entries(narrativeScores)
        .sort((a, b) => b[1] - a[1]);

    const narrative = {
      title:
        sortedNarratives[0]?.[0] ||
        "Unknown",
      confidence: Math.min(
        100,
        sortedNarratives[0]?.[1] * 8
      )
    };

    const networkHealth =
      Math.min(
        100,
        Math.round(
          (links.length /
            Math.max(nodes.length, 1)) * 20
        )
      );

    res.json({
      sentiment: sentimentScore,

      graph: {
        nodes,
        links
      },

      articles,

      keywords,

      topEntities,

      networkHealth,

      geoRanking,

      timeline: timeline
        .sort(
          (a, b) =>
            new Date(b.publishedAt) -
            new Date(a.publishedAt)
        )
        .slice(0, 15),

      sourceCredibility,

      narrative
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

app.listen(5000, () => {
  console.log(
    "🚀 ShadowNet X Intelligence Engine Running On Port 5000"
  );
});