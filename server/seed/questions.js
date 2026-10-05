require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("../models/Question");

const questions = [
    {
        department: "Computer Science",
        questionText: "What is the time complexity of binary search on a sorted array?",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        correctOptionIndex: 1,
        explanation: "Binary search halves the search space each step, giving O(log n).",
    },
    {
        department: "Computer Science",
        questionText: "Which data structure uses LIFO (Last In, First Out) order?",
        options: ["Queue", "Stack", "Linked List", "Tree"],
        correctOptionIndex: 1,
        explanation: "A stack follows LIFO — the last element pushed is the first popped.",
    },
    {
        department: "Mechanical",
        questionText: "What does the First Law of Thermodynamics describe?",
        options: ["Conservation of momentum", "Conservation of energy", "Conservation of mass", "Entropy always increases"],
        correctOptionIndex: 1,
        explanation: "The First Law states energy cannot be created or destroyed, only converted.",
    },
    {
        department: "Electrical",
        questionText: "Ohm's Law relates voltage, current, and what?",
        options: ["Power", "Resistance", "Frequency", "Capacitance"],
        correctOptionIndex: 1,
        explanation: "Ohm's Law: V = I × R, relating voltage, current, and resistance.",
    },
    {
        department: "Civil",
        questionText: "Which material is primarily used to resist tensile forces in reinforced concrete?",
        options: ["Cement", "Steel reinforcement", "Sand", "Aggregate"],
        correctOptionIndex: 1,
        explanation: "Concrete is strong in compression but weak in tension — steel rebar handles tension.",
    },
    {
        department: "Electronics",
        questionText: "What does a transistor primarily function as in a circuit?",
        options: ["Energy storage", "Amplifier/switch", "Voltage source", "Resistor"],
        correctOptionIndex: 1,
        explanation: "Transistors are commonly used as amplifiers or electronic switches.",
    },
];

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log(`Seeded ${questions.length} questions.`);
    process.exit(0);
}

seed();