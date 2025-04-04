"use server";

import { MongoDBChatMessageHistory } from "@langchain/mongodb";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferWindowMemory } from "langchain/memory";
import Interviewee from "@/models/Interviewee";
import Question from "@/models/Question";
import Interview from "@/models/Interview";
import mongoose from "mongoose";
import Feedback from "@/models/Feedback";
import Answer from "@/models/Answer";
import connectDB from "@/lib/mongoose";

async function initializeLangChain(sessionId, candidateData) {
  try {
    // Initialize MongoDB message history
    const messageHistory = new MongoDBChatMessageHistory({
      collection: mongoClient.db("test").collection("chat_history"),
      sessionId: sessionId,
    });

    // Create memory using the MongoDB message history
    const memory = new BufferWindowMemory({
      chatHistory: messageHistory,
      returnMessages: true,
      memoryKey: "history",
      k: 10, // Number of previous messages to keep in context
    });

    // Set up the LLM
    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      modelName: "gpt-4o", // Or your preferred model
    });

    // Create conversation chain
    const chain = new ConversationChain({
      llm: model,
      memory: memory,
    });

    // Add system message about candidate and interview context
    await chain.call({
      input: `You are a technical interviewer conducting a coding interview. The candidate has the following skills: ${candidateData.skills.join(
        ", "
      )}. Their experience level is ${
        candidateData.experienceLevel
      }. Please generate appropriate coding questions based on their skills and experience. 
  
        Instructions:
          - Keep the question clear and simple—no unnecessary complexity.
          - It should be solvable in 10–15 minutes.
          - Provide only the question, with clear context and requirements.
          - Do not include time estimates, explanations, or extra commentary.
          Just return the coding question.
        
        **IMPORTANT** just give me questions don't give me extra information.`,
    });

    return { chain, messageHistory };
  } catch (error) {
    console.error("Error initializing LangChain:", error);
    throw error;
  }
}

export async function createInterviewBusiness(formData) {
  console.log("Starting new interview");

  try {
    // Connect to the database
    await connectDB();

    // Get form data or directly pass an object
    const candidateId = formData.get
      ? formData.get("candidateId")
      : formData.candidateId;

    if (!candidateId) {
      return { error: "Missing candidateId", status: 400 };
    }

    // Get candidate data using Mongoose
    const candidate = await Interviewee.findById(candidateId);

    if (!candidate) {
      return { error: "Candidate not found", status: 404 };
    }

    // Create a new interview session
    const interviewId = uuidv4();
    const interview = new Interview({
      interviewId,
      candidateId,
      status: "in_progress",
      currentQuestionIndex: 0,
      startedAt: new Date(),
      updatedAt: new Date(),
    });

    await interview.save();

    // Initialize LangChain
    const { chain } = await initializeLangChain(
      interviewId,
      candidate.toObject()
    );

    // Generate first question
    const response = await chain.call({
      input:
        "Please generate a coding question for this interview. Focus on one of their skills. Make sure it's practical and can be solved in 10-15 minutes. Provide some context and clear requirements. **IMPORTANT** Just give me the question without extra information like task duration, give me simple question with minimal complication",
    });

    // Create a thread ID for this question
    const threadId = `${interviewId}-q0`;

    // Save question with status "active" directly using Mongoose
    const question = new Question({
      interviewId,
      questionIndex: 0,
      question: response.response,
      status: "active",
      threadId,
      startedAt: new Date(),
      createdAt: new Date(),
    });

    await question.save();

    // For MongoDBChatMessageHistory we still need to use the MongoDB native client
    // You could create a wrapper or alternative implementation for Mongoose
    const mongoClient = mongoose.connection.getClient();

    const messageHistory = new MongoDBChatMessageHistory({
      collection: mongoClient.db("test").collection("question_threads"),
      sessionId: threadId,
    });

    // Add initial message to question thread
    await messageHistory.addUserMessage(
      `Question: ${response.response}\n\nThe candidate is now starting to work on this question.`
    );

    return {
      success: true,
      interviewId,
      threadId,
      questionIndex: 0,
      question: response.response,
      status: "active",
    };
  } catch (error) {
    console.error("Error starting interview:", error);
    return { error: "Failed to start interview", status: 500 };
  }
}

export async function regenerateQuestion(interviewId) {
  try {
    // Connect to the database
    await connectDB();

    // Get interview data
    const interview = await Interview.findOne({ interviewId });

    if (!interview) {
      return { error: "Interview not found", status: 404 };
    }

    // Get candidate data
    const candidate = await Candidate.findById(interview.candidateId);

    if (!candidate) {
      return { error: "Candidate not found", status: 404 };
    }

    // Initialize LangChain with MongoDB
    const { chain } = await initializeLangChain(
      interviewId,
      candidate.toObject()
    );

    // Generate new question
    const response = await chain.call({
      input:
        "Please generate a different coding question for this interview. Focus on one of their skills that wasn't covered by the previous question. Make sure it's practical and can be solved in 15-20 minutes. Provide some context and clear requirements. **IMPORTANT** Just give me the question without extra information about task duration, give me simple question with minimal complication",
    });

    const questionIndex = interview.currentQuestionIndex;
    const threadId = `${interviewId}-q${questionIndex}`;

    // Update the current question or create if it doesn't exist
    await Question.findOneAndUpdate(
      { interviewId, questionIndex },
      {
        question: response.response,
        status: "active",
        threadId,
        startedAt: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // For MongoDBChatMessageHistory we still need to use the MongoDB native client
    const mongoClient = mongoose.connection.getClient();

    // Initialize thread for this question
    const messageHistory = new MongoDBChatMessageHistory({
      collection: mongoClient.db("test").collection("question_threads"),
      sessionId: threadId,
    });

    // Add initial message to question thread
    await messageHistory.addUserMessage(
      `Question: ${response.response}\n\nThe candidate is now starting to work on this question.`
    );

    return {
      success: true,
      interviewId,
      threadId,
      questionIndex,
      question: response.response,
      status: "active",
    };
  } catch (error) {
    console.error("Error regenerating question:", error);
    return { error: "Failed to regenerate question", status: 500 };
  }
}

export async function submitAnswer(interviewId, code) {
  try {
    // Connect to the database
    await connectDB();

    if (!code) {
      return { error: "Missing code submission", status: 400 };
    }

    // Get interview data
    const interview = await Interview.findOne({ interviewId });

    if (!interview) {
      return { error: "Interview not found", status: 404 };
    }

    const questionIndex = interview.currentQuestionIndex;

    // Get the question
    const question = await Question.findOne({
      interviewId,
      questionIndex,
      status: "active",
    });

    if (!question) {
      return { error: "No active question found", status: 400 };
    }

    const threadId = question.threadId || `${interviewId}-q${questionIndex}`;

    // For LangChain we need to use the MongoDB native client
    const mongoClient = mongoose.connection.getClient();

    // Initialize LangChain with the question thread ID
    const messageHistory = new MongoDBChatMessageHistory({
      collection: mongoClient.db("test").collection("question_threads"),
      sessionId: threadId,
    });

    const memory = new BufferWindowMemory({
      chatHistory: messageHistory,
      returnMessages: true,
      memoryKey: "history",
    });

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      modelName: "gpt-3.5-turbo",
    });

    const chain = new ConversationChain({
      llm: model,
      memory: memory,
    });

    // Save candidate's code submission
    const answer = new Answer({
      interviewId,
      questionIndex,
      threadId,
      code,
      submittedAt: new Date(),
    });

    await answer.save();

    // Add the code to the thread
    await messageHistory.addUserMessage(
      `The candidate has submitted the following code as their solution:\n\n${code}`
    );

    // Generate evaluation focusing on correctness and adding a score
    const evaluation = await chain.call({
      input: `Evaluate if this code correctly solves the problem. Your response should be in this format:
          
          First line: Start with either "CORRECT" or "INCORRECT"
          Second line: "SCORE: X/10" where X is a number from 1 to 10 that rates the quality of the solution
          Rest of response: A brief explanation justifying your assessment and score
          
          When scoring, consider correctness, efficiency, code quality, and best practices. A score of 10 would be a perfect solution, while a score of 1 would be a solution with major problems.`,
    });

    // Extract correctness status
    const isCorrect = evaluation.response.toUpperCase().startsWith("CORRECT");

    // Extract score using regex
    const scoreMatch = evaluation.response.match(
      /SCORE:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i
    );
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;

    // Extract feedback (remove the CORRECT/INCORRECT and SCORE lines)
    const feedback = evaluation.response
      .replace(/^(CORRECT|INCORRECT).*\n/i, "")
      .replace(/^SCORE:.*\n/i, "")
      .trim();

    // Save feedback with correctness status and score
    const feedbackEntry = new Feedback({
      interviewId,
      questionIndex,
      threadId,
      feedback,
      isCorrect,
      score,
      createdAt: new Date(),
    });

    await feedbackEntry.save();

    // Mark current question as completed
    await Question.findOneAndUpdate(
      { interviewId, questionIndex },
      {
        status: "completed",
        isCorrect,
        score,
        updatedAt: new Date(),
      }
    );

    // Generate next question automatically
    let nextResponse;
    let nextQuestionIndex = questionIndex + 1;

    // Update interview with next question index
    await Interview.findOneAndUpdate(
      { interviewId },
      {
        currentQuestionIndex: nextQuestionIndex,
        updatedAt: new Date(),
      }
    );

    // Initialize LangChain with the main interview session ID
    const mainMessageHistory = new MongoDBChatMessageHistory({
      collection: mongoClient.db("test").collection("chat_history"),
      sessionId: interviewId,
    });

    const mainMemory = new BufferWindowMemory({
      chatHistory: mainMessageHistory,
      returnMessages: true,
      memoryKey: "history",
    });

    const mainChain = new ConversationChain({
      llm: model,
      memory: mainMemory,
    });

    // Get candidate data
    const candidate = await Candidate.findById(interview.candidateId);

    if (!candidate) {
      return { error: "Candidate not found", status: 404 };
    }

    // Generate next question
    nextResponse = await mainChain.call({
      input: `Please generate the next coding question (question #${
        nextQuestionIndex + 1
      }) for this interview. Focus on a different skill than the previous question. Consider skills like: ${candidate.skills.join(
        ", "
      )}. Make sure it's practical and can be solved in 10-15 minutes. Provide clear requirements. **IMPORTANT** Just give me the question without extra information about task duration.`,
    });

    // Create a thread ID for the next question
    const nextThreadId = `${interviewId}-q${nextQuestionIndex}`;

    // Save next question with status "active" directly
    const nextQuestion = new Question({
      interviewId,
      questionIndex: nextQuestionIndex,
      question: nextResponse.response,
      status: "active",
      threadId: nextThreadId,
      startedAt: new Date(),
      createdAt: new Date(),
    });

    await nextQuestion.save();

    // Initialize thread for the next question
    const nextMessageHistory = new MongoDBChatMessageHistory({
      collection: mongoClient.db("langchain").collection("question_threads"),
      sessionId: nextThreadId,
    });

    // Add initial message to next question thread
    await nextMessageHistory.addUserMessage(
      `Question: ${nextResponse.response}\n\nThe candidate is now starting to work on this question.`
    );

    return {
      success: true,
      correct: isCorrect,
      score: score || 0,
      feedback,
      nextQuestion: {
        questionIndex: nextQuestionIndex,
        question: nextResponse.response,
        threadId: nextThreadId,
      },
    };
  } catch (error) {
    console.error("Error processing answer:", error);
    return { error: "Failed to process answer", status: 500 };
  }
}

export async function requestFeedback(interviewId, code) {
  try {
    // Connect to the database
    await connectDB();

    if (!code) {
      return { error: "Missing code submission", status: 400 };
    }

    // Get interview data
    const interview = await Interview.findOne({ interviewId });

    if (!interview) {
      return { error: "Interview not found", status: 404 };
    }

    const questionIndex = interview.currentQuestionIndex;

    // Get the question
    const question = await Question.findOne({
      interviewId,
      questionIndex,
      status: "active",
    });

    if (!question) {
      return { error: "No active question found", status: 400 };
    }

    const threadId = question.threadId || `${interviewId}-q${questionIndex}`;

    // For LangChain we need to use the MongoDB native client
    const mongoClient = mongoose.connection.getClient();

    // Initialize LangChain with the question thread ID
    const messageHistory = new MongoDBChatMessageHistory({
      collection: mongoClient.db("langchain").collection("question_threads"),
      sessionId: threadId,
    });

    const memory = new BufferWindowMemory({
      chatHistory: messageHistory,
      returnMessages: true,
      memoryKey: "history",
    });

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      modelName: "gpt-3.5-turbo",
    });

    const chain = new ConversationChain({
      llm: model,
      memory: memory,
    });

    // Add the code to the thread for feedback (without saving as a final submission)
    await messageHistory.addUserMessage(
      `The candidate is requesting feedback on the following code before final submission:\n\n${code}`
    );

    // Generate preliminary feedback
    const evaluation = await chain.call({
      input: `Please provide constructive feedback on this code. Focus on:
          
          1. Does it look like the solution is on the right track?
          2. Are there any logical errors or edge cases not handled?
          3. Suggestions for improvement
          4. Any best practices that should be applied
          
          This is preliminary feedback only, not a final evaluation. Be helpful and constructive without giving away the complete solution.`,
    });

    // Save this feedback request
    const feedbackRequest = new FeedbackRequest({
      interviewId,
      questionIndex,
      threadId,
      code,
      feedback: evaluation.response,
      timestamp: new Date(),
    });

    await feedbackRequest.save();

    // Return the feedback
    return {
      success: true,
      feedback: evaluation.response,
      isFinalSubmission: false,
    };
  } catch (error) {
    console.error("Error processing feedback request:", error);
    return { error: "Failed to generate feedback", status: 500 };
  }
}

export async function completeInterview(interviewId) {
  try {
    // Connect to database
    await connectDB();

    // Get interview data
    const interview = await Interview.findOne({ interviewId }).lean();

    if (!interview) {
      throw new Error("Interview not found");
    }

    // Get all questions and answers
    const questions = await Question.find({
      interviewId,
      status: "completed",
    })
      .sort({ questionIndex: 1 })
      .lean();

    if (questions.length === 0) {
      throw new Error("No completed questions found");
    }

    const questionIds = questions.map((q) => q.questionIndex);

    const answers = await Answer.find({
      interviewId,
      questionIndex: { $in: questionIds },
    })
      .sort({ questionIndex: 1 })
      .lean();

    const feedbacks = await Feedback.find({
      interviewId,
      questionIndex: { $in: questionIds },
    })
      .sort({ questionIndex: 1 })
      .lean();

    // Initialize LangChain with the existing session ID
    // Note: The MongoDB chat message history still needs the raw MongoDB client
    // Create a connection to pass to the message history
    const client = mongoose.connection.getClient();

    const messageHistory = new MongoDBChatMessageHistory({
      collection: client.db("langchain").collection("chat_history"),
      sessionId: interviewId,
    });

    const memory = new BufferWindowMemory({
      chatHistory: messageHistory,
      returnMessages: true,
      memoryKey: "history",
    });

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      modelName: "gpt-3.5-turbo",
    });

    const chain = new ConversationChain({
      llm: model,
      memory: memory,
    });

    // Prepare summary of all questions and answers
    let summary = "Here's a summary of the interview:\n\n";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const answer = answers.find((a) => a.questionIndex === q.questionIndex);
      const feedback = feedbacks.find(
        (f) => f.questionIndex === q.questionIndex
      );

      summary += `Question ${i + 1}: ${q.question}\n\n`;

      if (answer) {
        summary += `Answer ${i + 1}: ${answer.code}\n\n`;
      } else {
        summary += `Answer ${i + 1}: [No answer submitted]\n\n`;
      }

      if (feedback) {
        summary += `Feedback ${i + 1}: ${feedback.feedback}\n\n`;
        summary += `Correct: ${feedback.isCorrect ? "Yes" : "No"}\n\n`;
      } else {
        summary += `Feedback ${i + 1}: [No feedback provided]\n\n`;
      }
    }

    // Generate final assessment
    const finalAssessment = await chain.call({
      input: `${summary}\n\nBased on the candidate's performance in this coding interview, please provide a comprehensive assessment. Include the following: 1. Overall score (1-10) 2. Technical strengths demonstrated 3. Areas for improvement 4. Code quality assessment 5. Problem-solving ability 6. Final hiring recommendation (Hire, Consider, or Do Not Hire)`,
    });

    // Update interview status
    await Interview.updateOne(
      { interviewId },
      {
        $set: {
          status: "completed",
          finalAssessment: finalAssessment.response,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Revalidate relevant paths to update the UI
    //   revalidatePath(`/interviews/${interviewId}`)
    //   revalidatePath('/interviews')

    return {
      success: true,
      finalAssessment: finalAssessment.response,
    };
  } catch (error) {
    console.error("Error completing interview:", error);
    throw new Error(
      `Failed to complete interview: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export { initializeLangChain };
