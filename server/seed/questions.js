require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("../models/Question");

const questions = [
    // ---------- Computer Science ----------
    {
        department: "Computer Science",
        questionText: "What is the time complexity of binary search on a sorted array?",
        options: ["O(n)", "O(n log n)", "O(1)", "O(log n)"],
        correctOptionIndex: 3,
        explanation: "Binary search halves the search space each step, giving O(log n).",
    },
    {
        department: "Computer Science",
        questionText: "Which data structure uses LIFO (Last In, First Out) order?",
        options: ["Queue", "Linked List", "Stack", "Tree"],
        correctOptionIndex: 2,
        explanation: "A stack follows LIFO. The last element pushed is the first one popped.",
    },
    {
        department: "Computer Science",
        questionText: "Which SQL statement removes a table completely, including its structure and data?",
        options: ["DROP", "DELETE", "TRUNCATE", "REMOVE"],
        correctOptionIndex: 0,
        explanation: "DROP deletes the table itself. DELETE and TRUNCATE only remove rows and leave the table in place.",
    },
    {
        department: "Computer Science",
        questionText: "Which HTTP status code means the requested page was not found?",
        options: ["200", "404", "301", "500"],
        correctOptionIndex: 1,
        explanation: "404 is Not Found. 200 means success, 301 a permanent redirect and 500 a server error.",
    },
    {
        department: "Computer Science",
        questionText: "What is it called when different classes respond to the same method call in their own way?",
        options: ["Encapsulation", "Inheritance", "Abstraction", "Polymorphism"],
        correctOptionIndex: 3,
        explanation: "Polymorphism lets one method name behave differently depending on the object that receives it.",
    },
    {
        department: "Computer Science",
        questionText: "Which sorting algorithm guarantees O(n log n) time even in the worst case?",
        options: ["Bubble sort", "Quick sort", "Merge sort", "Insertion sort"],
        correctOptionIndex: 2,
        explanation: "Merge sort always splits and merges in O(n log n). Quick sort can degrade to O(n²) in the worst case.",
    },

    // ---------- Mechanical ----------
    {
        department: "Mechanical",
        questionText: "What does the First Law of Thermodynamics describe?",
        options: ["Conservation of momentum", "Conservation of mass", "Entropy always increases", "Conservation of energy"],
        correctOptionIndex: 3,
        explanation: "The First Law states energy cannot be created or destroyed, only converted.",
    },
    {
        department: "Mechanical",
        questionText: "Which ideal cycle is used to model a petrol (spark-ignition) engine?",
        options: ["Otto cycle", "Diesel cycle", "Rankine cycle", "Brayton cycle"],
        correctOptionIndex: 0,
        explanation: "The Otto cycle models spark-ignition engines. Diesel models diesel engines, Rankine models steam plants and Brayton models gas turbines.",
    },
    {
        department: "Mechanical",
        questionText: "What is the SI unit of stress?",
        options: ["Newton", "Joule", "Pascal", "Watt"],
        correctOptionIndex: 2,
        explanation: "Stress is force per unit area (N/m²), which is one pascal.",
    },
    {
        department: "Mechanical",
        questionText: "Which law of thermodynamics says no heat engine can be 100% efficient?",
        options: ["First law", "Second law", "Zeroth law", "Third law"],
        correctOptionIndex: 1,
        explanation: "The Second Law (Kelvin-Planck statement) says some heat must always be rejected to a cold reservoir.",
    },
    {
        department: "Mechanical",
        questionText: "Which fluid property measures resistance to flow?",
        options: ["Density", "Surface tension", "Viscosity", "Compressibility"],
        correctOptionIndex: 2,
        explanation: "Viscosity is the internal friction of a fluid. Honey has a higher viscosity than water.",
    },
    {
        department: "Mechanical",
        questionText: "Which property lets a metal be drawn into thin wires?",
        options: ["Hardness", "Malleability", "Toughness", "Ductility"],
        correctOptionIndex: 3,
        explanation: "Ductility is the ability to be drawn into wires. Malleability is the ability to be hammered into sheets.",
    },

    // ---------- Electrical ----------
    {
        department: "Electrical",
        questionText: "Ohm's Law relates voltage, current, and what?",
        options: ["Power", "Frequency", "Capacitance", "Resistance"],
        correctOptionIndex: 3,
        explanation: "Ohm's Law: V = I × R, relating voltage, current, and resistance.",
    },
    {
        department: "Electrical",
        questionText: "In a series circuit, which quantity is the same through every component?",
        options: ["Voltage", "Current", "Resistance", "Power"],
        correctOptionIndex: 1,
        explanation: "There is only one path, so the same current flows through each component while the voltage divides between them.",
    },
    {
        department: "Electrical",
        questionText: "What does a transformer change between its primary and secondary windings?",
        options: ["Frequency", "AC into DC", "Total power", "Voltage and current levels"],
        correctOptionIndex: 3,
        explanation: "A transformer steps voltage up or down, with the current changing the opposite way. Frequency stays the same and it cannot turn AC into DC.",
    },
    {
        department: "Electrical",
        questionText: "Which device converts alternating current (AC) into direct current (DC)?",
        options: ["Rectifier", "Inverter", "Transformer", "Capacitor"],
        correctOptionIndex: 0,
        explanation: "A rectifier converts AC to DC. An inverter does the opposite.",
    },
    {
        department: "Electrical",
        questionText: "What is the SI unit of capacitance?",
        options: ["Henry", "Weber", "Farad", "Tesla"],
        correctOptionIndex: 2,
        explanation: "Capacitance is measured in farads. The henry is for inductance, the weber for magnetic flux and the tesla for flux density.",
    },
    {
        department: "Electrical",
        questionText: "Kirchhoff's Current Law says the current entering a node equals what?",
        options: ["The sum of currents leaving the node", "Zero volts", "The supply voltage", "The total resistance"],
        correctOptionIndex: 0,
        explanation: "Charge cannot build up at a node, so the current going in equals the current coming out.",
    },

    // ---------- Civil ----------
    {
        department: "Civil",
        questionText: "Which material is primarily used to resist tensile forces in reinforced concrete?",
        options: ["Cement", "Steel reinforcement", "Sand", "Aggregate"],
        correctOptionIndex: 1,
        explanation: "Concrete is strong in compression but weak in tension. Steel rebar handles the tension.",
    },
    {
        department: "Civil",
        questionText: "What is the chemical reaction that makes cement set and harden?",
        options: ["Oxidation", "Carbonation", "Hydration", "Evaporation"],
        correctOptionIndex: 2,
        explanation: "Cement hardens through hydration, a reaction with water, rather than by simply drying out.",
    },
    {
        department: "Civil",
        questionText: "Which test measures the workability of fresh concrete?",
        options: ["Slump test", "Vicat test", "Cube test", "Los Angeles test"],
        correctOptionIndex: 0,
        explanation: "The slump test measures consistency. The Vicat test checks cement setting time, the cube test checks compressive strength and the Los Angeles test checks aggregate abrasion.",
    },
    {
        department: "Civil",
        questionText: "Where is the bending moment greatest in a simply supported beam with a point load at the centre?",
        options: ["At the supports", "At quarter span", "It is the same everywhere", "At the midspan, under the load"],
        correctOptionIndex: 3,
        explanation: "The bending moment is zero at the supports and reaches its maximum at midspan under the load.",
    },
    {
        department: "Civil",
        questionText: "In building construction, what does DPC stand for?",
        options: ["Direct Pressure Concrete", "Dual Pipe Connection", "Damp Proof Course", "Deep Pile Cap"],
        correctOptionIndex: 2,
        explanation: "A damp proof course is a barrier that stops moisture rising up through walls.",
    },
    {
        department: "Civil",
        questionText: "Which surveying instrument measures both horizontal and vertical angles?",
        options: ["Planimeter", "Ranging rod", "Clinometer", "Theodolite"],
        correctOptionIndex: 3,
        explanation: "A theodolite measures horizontal and vertical angles. A planimeter measures area.",
    },

    // ---------- Electronics ----------
    {
        department: "Electronics",
        questionText: "What does a transistor primarily function as in a circuit?",
        options: ["Energy storage", "Amplifier/switch", "Voltage source", "Resistor"],
        correctOptionIndex: 1,
        explanation: "Transistors are commonly used as amplifiers or electronic switches.",
    },
    {
        department: "Electronics",
        questionText: "Which semiconductor device lets current flow mainly in one direction?",
        options: ["Resistor", "Capacitor", "Diode", "Inductor"],
        correctOptionIndex: 2,
        explanation: "A diode conducts when forward biased and blocks current when reverse biased.",
    },
    {
        department: "Electronics",
        questionText: "What is the main job of a capacitor?",
        options: ["Amplify signals", "Limit current", "Convert AC to DC", "Store energy in an electric field"],
        correctOptionIndex: 3,
        explanation: "A capacitor stores charge and energy in an electric field.",
    },
    {
        department: "Electronics",
        questionText: "Which logic gate outputs 1 only when all of its inputs are 1?",
        options: ["AND", "OR", "XOR", "NOR"],
        correctOptionIndex: 0,
        explanation: "An AND gate outputs 1 only when every input is 1.",
    },
    {
        department: "Electronics",
        questionText: "What does LED stand for?",
        options: ["Low Energy Device", "Linear Electronic Display", "Light Emitting Diode", "Light Evolving Diode"],
        correctOptionIndex: 2,
        explanation: "An LED is a Light Emitting Diode, a diode that gives off light when current flows through it.",
    },
    {
        department: "Electronics",
        questionText: "What is the ideal input impedance of an operational amplifier?",
        options: ["Zero", "50 Ω", "1 kΩ", "Infinite"],
        correctOptionIndex: 3,
        explanation: "An ideal op-amp draws no input current, so its input impedance is infinite.",
    },
];

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);

    // Adds new questions and updates existing ones. Nothing is deleted.
    const result = await Question.bulkWrite(
        questions.map((q) => ({
            updateOne: {
                filter: { department: q.department, questionText: q.questionText },
                update: { $set: q },
                upsert: true,
            },
        }))
    );

    console.log(`Added ${result.upsertedCount} new questions, updated ${result.modifiedCount}.`);
    console.log(`Total questions in the database: ${await Question.countDocuments()}`);
    process.exit(0);
}

seed();