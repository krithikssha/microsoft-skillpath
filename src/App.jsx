import { useState, useEffect } from "react"
import "./App.css"
import { getAIExplanation } from "./gemini"

function App() {
  const [selectedDomain, setSelectedDomain] = useState(null)

  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem("microsoftSkillPathCompleted")
    return saved ? JSON.parse(saved) : []
  })

  const [aiExplanation, setAiExplanation] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  const roadmaps = {
    Cloud: [
      {
        id: "cloud-concepts",
        name: "Describe cloud concepts",
        type: "Learning Path",
        description:
          "Learn the fundamentals of cloud computing, cloud models, benefits, and service types.",
        prerequisite: null,
        link:
          "https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/",
        learnLink:
          "https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/"
      },
      {
        id: "azure-architecture",
        name: "Describe Azure architecture and services",
        type: "Learning Path",
        description:
          "Learn about Azure infrastructure, compute, networking, storage, identity, access, and security.",
        prerequisite: "cloud-concepts",
        link:
          "https://learn.microsoft.com/en-us/training/paths/azure-fundamentals-describe-azure-architecture-services/",
        learnLink:
          "https://learn.microsoft.com/en-us/training/paths/azure-fundamentals-describe-azure-architecture-services/"
      },
      {
        id: "azure-management",
        name: "Describe Azure management and governance",
        type: "Learning Path",
        description:
          "Learn about Azure cost management, governance, compliance, resource management, and monitoring.",
        prerequisite: "azure-architecture",
        link:
          "https://learn.microsoft.com/en-us/training/paths/describe-azure-management-governance/",
        learnLink:
          "https://learn.microsoft.com/en-us/training/paths/describe-azure-management-governance/"
      },
      {
        id: "AZ-900",
        name: "Microsoft Certified: Azure Fundamentals",
        type: "Certification",
        description:
          "Validate your foundational knowledge of cloud concepts and Microsoft Azure.",
        prerequisite: "azure-management",
        link:
          "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
        learnLink:
          "https://learn.microsoft.com/en-us/training/azure/"
      }
    ],

    "AI & Data": [
      {
        id: "AI-foundations",
        name: "Introduction to AI concepts",
        type: "Learning Path",
        description:
          "Build a foundation in artificial intelligence concepts and Azure AI capabilities.",
        prerequisite: null,
        link: "https://learn.microsoft.com/en-us/training/",
        learnLink: "https://learn.microsoft.com/en-us/training/"
      },
      {
        id: "AI-901",
        name: "Microsoft Certified: Azure AI Fundamentals",
        type: "Certification",
        description:
          "Build foundational knowledge of artificial intelligence and Azure AI services.",
        prerequisite: "AI-foundations",
        link:
          "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/",
        learnLink:
          "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/"
      },
      {
        id: "data-concepts",
        name: "Describe core data concepts",
        type: "Learning Path",
        description:
          "Learn foundational data concepts, relational data, non-relational data, and analytics.",
        prerequisite: "AI-901",
        link:
          "https://learn.microsoft.com/en-us/training/paths/describe-core-data-concepts/",
        learnLink:
          "https://learn.microsoft.com/en-us/training/paths/describe-core-data-concepts/"
      },
      {
        id: "DP-900",
        name: "Microsoft Certified: Azure Data Fundamentals",
        type: "Certification",
        description:
          "Demonstrate foundational knowledge of core data concepts and Azure data services.",
        prerequisite: "data-concepts",
        link:
          "https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/",
        learnLink:
          "https://learn.microsoft.com/en-us/training/paths/describe-core-data-concepts/"
      }
    ],

    Security: [
      {
        id: "security-foundations",
        name: "Describe security, compliance, and identity concepts",
        type: "Learning Path",
        description:
          "Learn the fundamentals of security, compliance, identity, and access management.",
        prerequisite: null,
        link: "https://learn.microsoft.com/en-us/training/",
        learnLink: "https://learn.microsoft.com/en-us/training/"
      },
      {
        id: "SC-900",
        name:
          "Microsoft Certified: Security, Compliance, and Identity Fundamentals",
        type: "Certification",
        description:
          "Learn foundational concepts across security, compliance, and identity.",
        prerequisite: "security-foundations",
        link:
          "https://learn.microsoft.com/en-us/credentials/certifications/security-compliance-and-identity-fundamentals/",
        learnLink:
          "https://learn.microsoft.com/en-us/credentials/certifications/security-compliance-and-identity-fundamentals/"
      },
      {
        id: "identity-management",
        name: "Explore Microsoft Entra identity and access",
        type: "Learning Path",
        description:
          "Learn how Microsoft Entra helps manage identities, authentication, and access.",
        prerequisite: "SC-900",
        link: "https://learn.microsoft.com/en-us/training/",
        learnLink: "https://learn.microsoft.com/en-us/training/"
      },
      {
        id: "SC-300",
        name:
          "Microsoft Certified: Identity and Access Administrator Associate",
        type: "Certification",
        description:
          "Learn how to manage identities and access using Microsoft Entra.",
        prerequisite: "identity-management",
        link:
          "https://learn.microsoft.com/en-us/credentials/certifications/identity-and-access-administrator/",
        learnLink:
          "https://learn.microsoft.com/en-us/credentials/certifications/identity-and-access-administrator/"
      }
    ]
  }

  const allItems = Object.values(roadmaps).flat()

  const overallCompleted = allItems.filter((item) =>
    completed.includes(item.id)
  ).length

  const overallPercentage =
    allItems.length > 0
      ? (overallCompleted / allItems.length) * 100
      : 0

  const selectedItems = selectedDomain
    ? roadmaps[selectedDomain]
    : []

  const completedCount = selectedItems.filter((item) =>
    completed.includes(item.id)
  ).length

  const progressPercentage =
    selectedItems.length > 0
      ? (completedCount / selectedItems.length) * 100
      : 0

  const isAvailable = (item) => {
    if (item.prerequisite === null) {
      return true
    }

    return completed.includes(item.prerequisite)
  }

  const markComplete = (id) => {
    if (!completed.includes(id)) {
      setCompleted((previous) => [...previous, id])
    }
  }

  const chooseGoal = (goal) => {
    setSelectedDomain(goal)
    setAiExplanation("")
  }

  const getDomainProgress = (domain) => {
    const items = roadmaps[domain]

    const done = items.filter((item) =>
      completed.includes(item.id)
    ).length

    return {
      done,
      total: items.length,
      percentage: (done / items.length) * 100
    }
  }

  const getNextLearningItem = () => {
    for (const domain of Object.keys(roadmaps)) {
      const items = roadmaps[domain]

      const nextItem = items.find(
        (item) =>
          !completed.includes(item.id) &&
          isAvailable(item)
      )

      if (nextItem) {
        return {
          domain,
          item: nextItem
        }
      }
    }

    return null
  }

  const nextLearning = getNextLearningItem()

  useEffect(() => {
    localStorage.setItem(
      "microsoftSkillPathCompleted",
      JSON.stringify(completed)
    )
  }, [completed])

  useEffect(() => {
    if (!selectedDomain) {
      return
    }

    const items = roadmaps[selectedDomain]

    const nextItem = items.find(
      (item) =>
        isAvailable(item) &&
        !completed.includes(item.id)
    )

    if (!nextItem) {
      setAiExplanation(
        "🎉 You have completed this entire learning roadmap!"
      )
      return
    }

    const completedNames = items
      .filter((item) => completed.includes(item.id))
      .map((item) => item.name)

    const remainingItems = items
      .filter(
        (item) =>
          item.id !== nextItem.id &&
          !completed.includes(item.id)
      )
      .map((item) => item.name)

    setAiLoading(true)
    setAiExplanation("")

    getAIExplanation(
      nextItem.name,
      completedNames,
      remainingItems,
      selectedDomain
    )
      .then((explanation) => {
        setAiExplanation(explanation)
      })
      .catch(() => {
        setAiExplanation(
          "This is your recommended next step because it builds on the skills you have already completed and moves you closer to your chosen goal."
        )
      })
      .finally(() => {
        setAiLoading(false)
      })
  }, [selectedDomain, completed])

  return (
    <div className="app">

      {/* =========================
          HEADER
      ========================= */}

      <div className="header">

        <div className="header-badge">
          ✦ MICROSOFT LEARNING ROADMAP
        </div>

        <h1>
          Shape your future
          <span> with Microsoft.</span>
        </h1>

        <p>
          Learn the right skills, follow a clear roadmap,
          and work towards Microsoft certifications.
        </p>

      </div>


      {/* =========================
          HOMEPAGE
      ========================= */}

      {!selectedDomain && (
        <>

          <div className="hero-section">

            <div className="hero-content">

              <div className="hero-text">

                <div className="hero-mini-label">
                  YOUR SKILL JOURNEY
                </div>

                <h2>
                  Turn your goals into
                  <strong> real skills.</strong>
                </h2>

                <p>
                  Choose a career direction and get a
                  structured Microsoft learning path
                  that takes you from fundamentals to
                  certification.
                </p>

                <div className="hero-actions">

                  {nextLearning ? (

                    <button
                      className="hero-button"
                      onClick={() =>
                        setSelectedDomain(
                          nextLearning.domain
                        )
                      }
                    >
                      Continue Learning →
                    </button>

                  ) : (

                    <button
                      className="hero-button"
                      onClick={() =>
                        document
                          .querySelector(".goal-section")
                          ?.scrollIntoView({
                            behavior: "smooth"
                          })
                      }
                    >
                      Choose Your Path →
                    </button>

                  )}

                </div>

              </div>


              <div className="hero-progress-card">

                <div className="hero-progress-top">

                  <span>
                    Overall progress
                  </span>

                  <span className="hero-percentage">
                    {Math.round(overallPercentage)}%
                  </span>

                </div>


                <div className="hero-circle">

                  <div className="hero-circle-inner">

                    <strong>
                      {overallCompleted}
                    </strong>

                    <span>
                      / {allItems.length}
                    </span>

                  </div>

                </div>


                <p>
                  {overallCompleted === 0
                    ? "Your journey starts here."
                    : overallCompleted === allItems.length
                    ? "Amazing! You've completed everything."
                    : "Keep going — you're making progress."}
                </p>

              </div>

            </div>

          </div>


          {/* =========================
              GOALS
          ========================= */}

          <div className="goal-section">

            <div className="section-heading">

              <span className="section-label">
                EXPLORE
              </span>

              <h2>
                What do you want to get into?
              </h2>

              <p>
                Choose a career direction and we'll build
                your Microsoft learning roadmap.
              </p>

            </div>


            <div className="goal-options">

              <button
                className="goal-card cloud-card"
                onClick={() => chooseGoal("Cloud")}
              >

                <span className="goal-icon">
                  ☁️
                </span>

                <strong>
                  Cloud
                </strong>

                <span>
                  Azure & cloud computing
                </span>

                <div className="goal-arrow">
                  →
                </div>

              </button>


              <button
                className="goal-card ai-card"
                onClick={() => chooseGoal("AI & Data")}
              >

                <span className="goal-icon">
                  🤖
                </span>

                <strong>
                  AI & Data
                </strong>

                <span>
                  Artificial intelligence & data
                </span>

                <div className="goal-arrow">
                  →
                </div>

              </button>


              <button
                className="goal-card security-card"
                onClick={() => chooseGoal("Security")}
              >

                <span className="goal-icon">
                  🔐
                </span>

                <strong>
                  Security
                </strong>

                <span>
                  Cybersecurity & identity
                </span>

                <div className="goal-arrow">
                  →
                </div>

              </button>

            </div>

          </div>


          {/* =========================
              CONTINUE LEARNING
          ========================= */}

          {nextLearning && overallCompleted > 0 && (

            <div className="continue-section">

              <div className="continue-content">

                <div className="continue-icon">
                  ⚡
                </div>

                <div className="continue-info">

                  <p className="continue-label">
                    CONTINUE LEARNING
                  </p>

                  <h2>
                    {nextLearning.item.name}
                  </h2>

                  <p className="continue-description">
                    Your next step in the{" "}
                    {nextLearning.domain} roadmap.
                  </p>

                  <div className="continue-progress">

                    <div className="continue-progress-text">

                      <span>
                        {
                          getDomainProgress(
                            nextLearning.domain
                          ).done
                        }
                        {" / "}
                        {
                          getDomainProgress(
                            nextLearning.domain
                          ).total
                        }
                        {" completed"}
                      </span>

                      <span>
                        {Math.round(
                          getDomainProgress(
                            nextLearning.domain
                          ).percentage
                        )}
                        %
                      </span>

                    </div>

                    <div className="continue-progress-bar">

                      <div
                        className="continue-progress-fill"
                        style={{
                          width: `${
                            getDomainProgress(
                              nextLearning.domain
                            ).percentage
                          }%`
                        }}
                      />

                    </div>

                  </div>

                </div>

                <button
                  className="continue-button"
                  onClick={() =>
                    setSelectedDomain(
                      nextLearning.domain
                    )
                  }
                >
                  Continue Learning →
                </button>

              </div>

            </div>

          )}

        </>
      )}


      {/* =========================
          ROADMAP
      ========================= */}

      {selectedDomain && (

        <div className="roadmap">

          <button
            className="back-button"
            onClick={() => {
              setSelectedDomain(null)
              setAiExplanation("")
            }}
          >
            ← Back to domains
          </button>


          <div className="goal-heading">

            <div>

              <p
                className={`domain-tagline ${
                  selectedDomain === "Cloud"
                    ? "cloud-tagline"
                    : selectedDomain === "AI & Data"
                    ? "ai-tagline"
                    : "security-tagline"
                }`}
              >
                {selectedDomain === "Cloud" &&
                  "Build. Scale. Transform."}

                {selectedDomain === "AI & Data" &&
                  "Imagine. Analyze. Create."}

                {selectedDomain === "Security" &&
                  "Protect. Defend. Secure."}
              </p>


              <h2 className="domain-title">

                {selectedDomain === "Cloud" && "☁️"}
                {selectedDomain === "AI & Data" && "🤖"}
                {selectedDomain === "Security" && "🔐"}

                {" "}
                {selectedDomain}

              </h2>


              <p className="domain-subtitle">

                {selectedDomain === "Cloud" &&
                  "Azure & cloud computing"}

                {selectedDomain === "AI & Data" &&
                  "Artificial intelligence & data"}

                {selectedDomain === "Security" &&
                  "Cybersecurity & identity"}

              </p>

            </div>

          </div>


          <div className="progress-section">

            <div className="progress-header">

              <span>
                Progress
              </span>

              <span>
                {completedCount} / {selectedItems.length} completed
              </span>

            </div>

            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width: `${progressPercentage}%`
                }}
              />

            </div>

          </div>


          {(aiLoading || aiExplanation) && (

            <div className="ai-box">

              <h3>
                🤖 Why this comes next
              </h3>

              {aiLoading ? (

                <p>
                  ✨ Generating your personalized recommendation...
                </p>

              ) : (

                <p>
                  {aiExplanation}
                </p>

              )}

            </div>

          )}


          <div className="roadmap-timeline">

            {selectedItems.map((item, index) => {

              const completedAlready =
                completed.includes(item.id)

              const available =
                isAvailable(item)

              const isLast =
                index === selectedItems.length - 1

              const isCurrent =
                available && !completedAlready

              return (

                <div
                  className="timeline-item"
                  key={item.id}
                >

                  <div className="timeline-side">

                    <div
                      className={`timeline-dot ${
                        completedAlready
                          ? "dot-completed"
                          : available
                          ? "dot-available"
                          : "dot-locked"
                      }`}
                    >

                      {completedAlready
                        ? "✓"
                        : index + 1}

                    </div>

                    {!isLast && (

                      <div
                        className={`timeline-line ${
                          completedAlready
                            ? "line-completed"
                            : ""
                        }`}
                      />

                    )}

                  </div>


                  <div
                    className={`cert-card ${
                      completedAlready
                        ? "completed"
                        : isCurrent
                        ? "available current-step"
                        : "locked"
                    }`}
                  >

                    {isCurrent && (

                      <div className="current-badge">
                        CURRENT STEP
                      </div>

                    )}


                    <div className="cert-info">

                      <div className="cert-top-row">

                        <div
                          className={`status-icon ${
                            completedAlready
                              ? "status-completed"
                              : available
                              ? "status-current"
                              : "status-locked"
                          }`}
                        >

                          {completedAlready
                            ? "✓"
                            : available
                            ? "→"
                            : "🔒"}

                        </div>


                        <span
                          className={`cert-type ${
                            item.type === "Certification"
                              ? "certification-type"
                              : "learning-type"
                          }`}
                        >
                          {item.type}
                        </span>

                      </div>


                      <h2>
                        {item.name}
                      </h2>


                      <p className="cert-description">
                        {item.description}
                      </p>


                      {!available && (

                        <div className="locked-message">

                          <span>
                            🔒
                          </span>

                          <span>
                            Complete{" "}
                            {
                              selectedItems.find(
                                (previous) =>
                                  previous.id === item.prerequisite
                              )?.name ||
                              item.prerequisite
                            }{" "}
                            first.
                          </span>

                        </div>

                      )}


                      <div className="resource-links">

                        <a
                          className="learn-link"
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Microsoft Learn →
                        </a>

                        <a
                          className="learn-path-link"
                          href={item.learnLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📚 Start Learning
                        </a>

                      </div>

                    </div>


                    <div className="cert-action">

                      {available && !completedAlready && (

                        <button
                          onClick={() =>
                            markComplete(item.id)
                          }
                        >
                          Mark Complete
                        </button>

                      )}


                      {completedAlready && (

                        <div className="completed-label">

                          <span>
                            ✓
                          </span>

                          Completed

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              )

            })}

          </div>

        </div>

      )}

    </div>
  )
}

export default App