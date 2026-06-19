import { useState } from "react";
import axios from "axios";
import ForceGraph2D from "react-force-graph-2d";

export default function App() {

  const [query, setQuery] = useState("");

  const [graph, setGraph] = useState({
    nodes: [],
    links: []
  });

  const [articles, setArticles] = useState([]);

  const [sentiment, setSentiment] = useState(0);

  const [loading, setLoading] = useState(false);

  const [keywords, setKeywords] = useState([]);

  const [topEntities, setTopEntities] = useState([]);

  const [healthScore, setHealthScore] = useState(0);

  const [history, setHistory] = useState([]);

  const [timeline, setTimeline] = useState([]);

  const [geoRanking, setGeoRanking] = useState([]);

  const [sourceCredibility, setSourceCredibility] =
    useState([]);

  const [narrative, setNarrative] =
    useState({});

  const [selectedNode, setSelectedNode] =
    useState(null);

  const [systemStatus] =
    useState("ACTIVE");

  async function searchTopic() {

    if (!query.trim()) return;

    try {

      setLoading(true);

      const res =
        await axios.get(
          `http://localhost:5000/search?q=${query}`
        );

      setGraph(
        res.data.graph || {
          nodes: [],
          links: []
        }
      );

      setArticles(
        res.data.articles || []
      );

      setSentiment(
        res.data.sentiment || 0
      );

      setKeywords(
        res.data.keywords || []
      );

      setTopEntities(
        res.data.topEntities || []
      );

      setHealthScore(
        res.data.networkHealth || 0
      );

      setTimeline(
        res.data.timeline || []
      );

      setGeoRanking(
        res.data.geoRanking || []
      );

      setSourceCredibility(
        res.data.sourceCredibility || []
      );

      setNarrative(
        res.data.narrative || {}
      );

      setHistory(prev => [

        query,

        ...prev.filter(
          item => item !== query
        )

      ].slice(0, 10));

    }
    catch (err) {

      console.error(err);

      alert(
        "Failed to load intelligence data"
      );

    }
    finally {

      setLoading(false);

    }
  }

  const glassCard = {

    background:
      "rgba(15,23,42,.7)",

    backdropFilter:
      "blur(14px)",

    border:
      "1px solid rgba(56,189,248,.15)",

    borderRadius:
      "18px",

    boxShadow:
      "0 0 25px rgba(0,229,255,.12)",

    padding:
      "20px"

  };

  return (

    <div
      style={{

        minHeight:
          "100vh",

        background:
          "radial-gradient(circle at top,#111827,#020617,#000)",

        color:
          "white",

        padding:
          "25px",

        fontFamily:
          "Segoe UI"

      }}
    >

      <h1
        style={{

          textAlign:
            "center",

          fontSize:
            "4.5rem",

          marginBottom:
            "10px",

          color:
            "#00e5ff",

          textShadow:
            "0 0 30px #00e5ff"

        }}
      >

        SHADOWNET X

      </h1>

      <p
        style={{

          textAlign:
            "center",

          color:
            "#94a3b8",

          marginBottom:
            "30px",

          fontSize:
            "1.1rem"

        }}
      >

        AI-Powered Open Source
        Intelligence Platform

      </p>

      <div
        style={{

          ...glassCard,

          marginBottom:
            "20px",

          textAlign:
            "center"

        }}
      >

        🚀 SYSTEM STATUS :
        {systemStatus}

        {" | "}

        ARTICLES :
        {articles.length}

        {" | "}

        ENTITIES :
        {graph.nodes.length}

        {" | "}

        CONNECTIONS :
        {graph.links.length}

        {" | "}

        NETWORK HEALTH :
        {healthScore}%

      </div>

      <div
        style={{

          display:
            "flex",

          justifyContent:
            "center",

          gap:
            "12px",

          marginBottom:
            "20px"

        }}
      >

        <input

          value={query}

          onChange={(e) =>
            setQuery(
              e.target.value
            )
          }

          placeholder=
            "Investigate a topic..."

          style={{

            width:
              "500px",

            padding:
              "15px",

            borderRadius:
              "12px",

            border:
              "1px solid #334155",

            background:
              "#0f172a",

            color:
              "white"

          }}

        />

        <button

          onClick={
            searchTopic
          }

          style={{

            padding:
              "15px 30px",

            border:
              "none",

            borderRadius:
              "12px",

            cursor:
              "pointer",

            background:
              "linear-gradient(90deg,#06b6d4,#8b5cf6)",

            color:
              "white",

            fontWeight:
              "bold"

          }}

        >

          ANALYZE

        </button>

      </div>

      {loading && (

        <div
          style={{

            textAlign:
              "center",

            fontSize:
              "22px",

            marginBottom:
              "20px",

            color:
              "#00e5ff"

          }}
        >

          ⚡ SCANNING
          INTELLIGENCE
          NETWORK...

        </div>

      )}

      <div
        style={{

          display:
            "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",

          gap:
            "15px",

          marginBottom:
            "20px"

        }}
      >

        <StatCard
          title="Sentiment"
          value={sentiment}
        />

        <StatCard
          title="Entities"
          value={graph.nodes.length}
        />

        <StatCard
          title="Connections"
          value={graph.links.length}
        />

        <StatCard
          title="Health"
          value={healthScore}
        />

      </div>
            <div
        style={{
          height: "750px",
          ...glassCard,
          overflow: "hidden",
          marginBottom: "20px"
        }}
      >
        <ForceGraph2D
          graphData={graph}
          backgroundColor="#020617"
          nodeLabel="id"
          nodeRelSize={8}
          cooldownTicks={100}
          linkWidth={2}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={() => 0.004}
          linkColor={() => "#38bdf8"}
          onNodeClick={(node) => {

            const relatedArticles =
              articles.filter(article => {

                const text =
                  `${article.title || ""}
                   ${article.description || ""}`;

                return text
                  .toLowerCase()
                  .includes(
                    node.id.toLowerCase()
                  );

              });

            setSelectedNode({
              ...node,
              relatedArticles
            });

          }}
          nodeCanvasObject={(
            node,
            ctx,
            scale
          ) => {

            const label =
              node.id;

            const fontSize =
              12 / scale;

            ctx.beginPath();

            ctx.arc(
              node.x,
              node.y,
              6,
              0,
              2 * Math.PI
            );

            ctx.fillStyle =
              "#00e5ff";

            ctx.shadowBlur =
              20;

            ctx.shadowColor =
              "#00e5ff";

            ctx.fill();

            ctx.font =
              `${fontSize}px Sans-Serif`;

            ctx.fillStyle =
              "#ffffff";

            ctx.fillText(
              label,
              node.x + 10,
              node.y + 4
            );

          }}
        />
      </div>

      {selectedNode && (

        <div
          style={{
            ...glassCard,
            marginBottom: "20px"
          }}
        >

          <h2
            style={{
              color:
                "#00e5ff"
            }}
          >
            🔎 ENTITY INVESTIGATION
          </h2>

          <h3>
            {selectedNode.id}
          </h3>

          <p>
            Entity selected from
            intelligence graph.
          </p>

          <p>
            Related Articles:
            {" "}
            {
              selectedNode
                ?.relatedArticles
                ?.length || 0
            }
          </p>

          <div
            style={{
              marginTop:
                "15px"
            }}
          >

            {
              selectedNode
                ?.relatedArticles
                ?.slice(0,5)
                ?.map(
                  (
                    article,
                    index
                  ) => (

                    <div
                      key={index}
                      style={{
                        marginBottom:
                          "10px",
                        padding:
                          "10px",
                        border:
                          "1px solid #1e293b",
                        borderRadius:
                          "10px"
                      }}
                    >

                      <strong>
                        {
                          article.title
                        }
                      </strong>

                    </div>

                  )
                )
            }

          </div>

        </div>

      )}

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "1fr 1fr",

          gap:
            "20px",

          marginBottom:
            "20px"
        }}
      >

        <div
          style={{
            ...glassCard
          }}
        >

          <h2
            style={{
              color:
                "#00e5ff"
            }}
          >
            🧠 PRIMARY NARRATIVE
          </h2>

          <h3>
            {
              narrative?.title ||
              "Unknown"
            }
          </h3>

          <p>
            Confidence :
            {" "}
            {
              narrative?.confidence ||
              0
            }
            %
          </p>

        </div>

        <div
          style={{
            ...glassCard
          }}
        >

          <h2
            style={{
              color:
                "#00e5ff"
            }}
          >
            🌍 GEOGRAPHIC
            INTELLIGENCE
          </h2>

          {
            geoRanking
              .slice(0,8)
              .map(
                (
                  item,
                  index
                ) => (

                  <div
                    key={index}
                    style={{
                      marginBottom:
                        "8px"
                    }}
                  >

                    🌎
                    {" "}
                    {item[0]}
                    {" "}
                    (
                    {item[1]}
                    )

                  </div>

                )
              )
          }

        </div>

      </div>
            <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px"
        }}
      >

        <div
          style={{
            ...glassCard
          }}
        >

          <h2
            style={{
              color: "#00e5ff"
            }}
          >
            📈 TIMELINE
            INTELLIGENCE
          </h2>

          <div
            style={{
              maxHeight: "350px",
              overflowY: "auto"
            }}
          >

            {
              timeline
                .slice(0,10)
                .map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      key={index}
                      style={{
                        marginBottom:
                          "15px",
                        padding:
                          "10px",
                        border:
                          "1px solid #1e293b",
                        borderRadius:
                          "10px"
                      }}
                    >

                      <strong>

                        {
                          new Date(
                            item.publishedAt
                          ).toLocaleString()
                        }

                      </strong>

                      <br />

                      {
                        item.title
                      }

                    </div>

                  )
                )
            }

          </div>

        </div>

        <div
          style={{
            ...glassCard
          }}
        >

          <h2
            style={{
              color:
                "#00e5ff"
            }}
          >
            🛡 SOURCE
            RELIABILITY
          </h2>

          {
            sourceCredibility
              .slice(0,10)
              .map(
                (
                  item,
                  index
                ) => (

                  <div
                    key={index}
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      marginBottom:
                        "10px"
                    }}
                  >

                    <span>
                      {
                        item.source
                      }
                    </span>

                    <span>

                      {
                        item.score
                      }

                    </span>

                  </div>

                )
              )
          }

        </div>

      </div>

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "1fr 1fr 1fr",

          gap:
            "20px",

          marginBottom:
            "20px"
        }}
      >

        <div
          style={{
            ...glassCard
          }}
        >

          <h2
            style={{
              color:
                "#00e5ff"
            }}
          >
            🔥 EMERGING
            SIGNALS
          </h2>

          {
            keywords
              .slice(0,10)
              .map(
                (
                  item,
                  index
                ) => (

                  <div
                    key={index}
                    style={{
                      marginBottom:
                        "8px"
                    }}
                  >

                    #

                    {
                      item[0]
                    }

                    {" "}

                    (
                    {
                      item[1]
                    }
                    )

                  </div>

                )
              )
          }

        </div>

        <div
          style={{
            ...glassCard
          }}
        >

          <h2
            style={{
              color:
                "#00e5ff"
            }}
          >
            🏆 ENTITY
            INFLUENCE
            MATRIX
          </h2>

          {
            topEntities
              .slice(0,10)
              .map(
                (
                  item,
                  index
                ) => (

                  <div
                    key={index}
                    style={{
                      marginBottom:
                        "8px"
                    }}
                  >

                    {index + 1}

                    .

                    {" "}

                    {
                      item[0]
                    }

                    {" "}

                    (
                    {
                      item[1]
                    }
                    )

                  </div>

                )
              )
          }

        </div>

        <div
          style={{
            ...glassCard
          }}
        >

          <h2
            style={{
              color:
                "#00e5ff"
            }}
          >
            🕘 INVESTIGATION
            HISTORY
          </h2>

          {
            history.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  style={{
                    marginBottom:
                      "8px"
                  }}
                >

                  {item}

                </div>

              )
            )
          }

        </div>

      </div>

      <div
        style={{
          ...glassCard,
          marginBottom:
            "20px"
        }}
      >

        <h2
          style={{
            color:
              "#00e5ff"
          }}
        >
          🌐 GLOBAL
          INTELLIGENCE
          HEATMAP
        </h2>

        <div
          style={{
            display:
              "flex",
            flexWrap:
              "wrap",
            gap:
              "12px"
          }}
        >

          {
            geoRanking
              .slice(0,15)
              .map(
                (
                  item,
                  index
                ) => (

                  <div
                    key={index}
                    style={{
                      padding:
                        "12px",
                      border:
                        "1px solid #1e293b",
                      borderRadius:
                        "12px",
                      background:
                        "rgba(0,229,255,.08)"
                    }}
                  >

                    🌍

                    {" "}

                    {
                      item[0]
                    }

                    <br />

                    Mentions:

                    {" "}

                    {
                      item[1]
                    }

                  </div>

                )
              )
          }

        </div>

      </div>
            <div
        style={{
          ...glassCard
        }}
      >

        <h2
          style={{
            color:
              "#00e5ff",
            marginBottom:
              "20px"
          }}
        >
          📰 THREAT
          INTELLIGENCE
          FEED
        </h2>

        {
          articles
            .slice(0,10)
            .map(
              (
                article,
                index
              ) => (

                <a
                  key={index}
                  href={
                    article.url
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display:
                      "block",

                    textDecoration:
                      "none",

                    color:
                      "white",

                    marginBottom:
                      "15px",

                    padding:
                      "15px",

                    border:
                      "1px solid #1e293b",

                    borderRadius:
                      "12px",

                    background:
                      "rgba(255,255,255,.03)"
                  }}
                >

                  <h3>

                    {
                      article.title
                    }

                  </h3>

                  <p>

                    {
                      article.description
                    }

                  </p>

                </a>

              )
            )
        }

      </div>

    </div>

  );

}

function StatCard({
  title,
  value
}) {

  return (

    <div
      style={{

        background:
          "rgba(15,23,42,.7)",

        backdropFilter:
          "blur(14px)",

        border:
          "1px solid rgba(56,189,248,.15)",

        borderRadius:
          "18px",

        boxShadow:
          "0 0 25px rgba(0,229,255,.12)",

        padding:
          "20px",

        textAlign:
          "center"

      }}
    >

      <h4>

        {title}

      </h4>

      <h2
        style={{
          color:
            "#00e5ff"
        }}
      >

        {value}

      </h2>

    </div>

  );

}