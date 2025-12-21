const express = require("express");
const { body, validationResult } = require("express-validator");
const Reflection = require("../models/Reflection");
const Task = require("../models/Task");
const Leaderboard = require("../models/Leaderboard");
const { authenticateToken } = require("../middleware/auth");
const {
  getPreviousWeekStartDate,
  getPreviousWeekEndDate,
} = require("../utils/week");

const router = express.Router();

// Get previous week tasks for reflection
router.get("/previous-week-tasks", authenticateToken, async (req, res) => {
  try {
    const weekStart = getPreviousWeekStartDate();
    const weekEnd = getPreviousWeekEndDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    let task;
    
    if (day === 0) {
      // If today is Sunday, match by weekEndDate (same week)
      const startOfDay = new Date(weekEnd);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(weekEnd);
      endOfDay.setHours(23, 59, 59, 999);

      task = await Task.findOne({
        userId: req.user._id,
        weekEndDate: { $gte: startOfDay, $lte: endOfDay },
      });
    } else {
      // If today is Monday-Saturday, match by weekStartDate (previous week)
      const startOfDay = new Date(weekStart);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(weekStart);
      endOfDay.setHours(23, 59, 59, 999);

      task = await Task.findOne({
        userId: req.user._id,
        weekStartDate: { $gte: startOfDay, $lte: endOfDay },
      });
    }

    if (!task) {
      return res
        .status(404)
        .json({ message: "No tasks found for previous week" });
    }

    res.json({
      task: {
        id: task._id,
        weekStartDate: task.weekStartDate,
        weekEndDate: task.weekEndDate,
        customTasks: task.customTasks,
        screenTimeTarget: task.screenTimeTarget,
        bodyMovement: task.bodyMovement,
      },
    });
  } catch (error) {
    console.error("Get previous week tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Check if reflection already exists for previous week
router.get("/previous-week-reflection", authenticateToken, async (req, res) => {
  try {
    const weekStart = getPreviousWeekStartDate();
    const weekEnd = getPreviousWeekEndDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    let reflection;
    
    if (day === 0) {
      // If today is Sunday, match by weekEndDate (same week)
      const startOfDay = new Date(weekEnd);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(weekEnd);
      endOfDay.setHours(23, 59, 59, 999);

      reflection = await Reflection.findOne({
        userId: req.user._id,
        weekEndDate: { $gte: startOfDay, $lte: endOfDay },
      });
    } else {
      // If today is Monday-Saturday, match by weekStartDate (previous week)
      const startOfDay = new Date(weekStart);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(weekStart);
      endOfDay.setHours(23, 59, 59, 999);

      reflection = await Reflection.findOne({
        userId: req.user._id,
        weekStartDate: { $gte: startOfDay, $lte: endOfDay },
      });
    }

    if (reflection) {
      return res.json({
        exists: true,
        reflection: {
          id: reflection._id,
          weekStartDate: reflection.weekStartDate,
          weekEndDate: reflection.weekEndDate,
          customTaskReflections: reflection.customTaskReflections,
          screenTimeReflection: reflection.screenTimeReflection,
          bodyMovementReflection: reflection.bodyMovementReflection,
          completionPercentage: reflection.completionPercentage,
        },
      });
    }

    res.json({ exists: false });
  } catch (error) {
    console.error("Check reflection error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit reflection
router.post(
  "/submit",
  authenticateToken,
  [
    body("customTaskReflections")
      .isArray()
      .notEmpty()
      .withMessage("Custom task reflections are required"),
    body("customTaskReflections.*.completed")
      .isBoolean()
      .withMessage("Completed status must be a boolean"),
    body("screenTimeReflection")
      .exists()
      .withMessage("Screen time reflection is required"),
    body("screenTimeReflection.completed")
      .isBoolean()
      .withMessage("Screen time reflection completion must be a boolean"),
    body("bodyMovementReflection")
      .exists()
      .withMessage("Body movement reflection is required"),
    body("bodyMovementReflection.completed")
      .isBoolean()
      .withMessage("Body movement reflection completion must be a boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        customTaskReflections,
        screenTimeReflection,
        bodyMovementReflection,
      } = req.body;
      const weekStart = getPreviousWeekStartDate();
      const weekEnd = getPreviousWeekEndDate();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      // Check if reflection already exists
      let existingReflection;
      if (day === 0) {
        // If today is Sunday, match by weekEndDate (same week)
        const startOfDay = new Date(weekEnd);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(weekEnd);
        endOfDay.setHours(23, 59, 59, 999);

        existingReflection = await Reflection.findOne({
          userId: req.user._id,
          weekEndDate: { $gte: startOfDay, $lte: endOfDay },
        });
      } else {
        // If today is Monday-Saturday, match by weekStartDate (previous week)
        const startOfDay = new Date(weekStart);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(weekStart);
        endOfDay.setHours(23, 59, 59, 999);

        existingReflection = await Reflection.findOne({
          userId: req.user._id,
          weekStartDate: { $gte: startOfDay, $lte: endOfDay },
        });
      }

      if (existingReflection) {
        return res
          .status(400)
          .json({ message: "Reflection already submitted for this week" });
      }

      // Get the original tasks to calculate completion percentage
      let task;
      if (day === 0) {
        // If today is Sunday, match by weekEndDate (same week)
        const startOfDay = new Date(weekEnd);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(weekEnd);
        endOfDay.setHours(23, 59, 59, 999);

        task = await Task.findOne({
          userId: req.user._id,
          weekEndDate: { $gte: startOfDay, $lte: endOfDay },
        });
      } else {
        // If today is Monday-Saturday, match by weekStartDate (previous week)
        const startOfDay = new Date(weekStart);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(weekStart);
        endOfDay.setHours(23, 59, 59, 999);

        task = await Task.findOne({
          userId: req.user._id,
          weekStartDate: { $gte: startOfDay, $lte: endOfDay },
        });
      }

      if (!task) {
        return res
          .status(404)
          .json({ message: "No tasks found for previous week" });
      }

      // Calculate completion percentage
      let completedCount = 0;
      let totalCount = 0;

      // Count custom tasks
      totalCount += task.customTasks.length;
      customTaskReflections.forEach((reflection) => {
        if (reflection.completed) completedCount++;
      });

      // Count screen time task
      if (task.screenTimeTarget !== null) {
        totalCount++;
        if (screenTimeReflection.completed) completedCount++;
      }

      // Count body movement task
      totalCount++;
      if (bodyMovementReflection.completed) completedCount++;

      const completionPercentage =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      // Create reflection
      const reflection = new Reflection({
        userId: req.user._id,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        customTaskReflections,
        screenTimeReflection,
        bodyMovementReflection,
        completionPercentage,
      });
      await reflection.save();

      // Update leaderboard score
      let leaderboard = await Leaderboard.findOne({ userId: req.user._id });
      if (leaderboard) {
        leaderboard.score += completionPercentage;
        leaderboard.lastUpdated = new Date();
        leaderboard.name = leaderboard.name || req.user.name;
      } else {
        const user = await require("../models/User").findById(req.user._id);
        leaderboard = new Leaderboard({
          userId: req.user._id,
          name: user.name,
          email: user.email,
          score: completionPercentage,
        });
      }
      await leaderboard.save();

      res.json({
        message: "Reflection submitted successfully",
        reflection: {
          id: reflection._id,
          completionPercentage,
          newLeaderboardScore: leaderboard.score,
        },
      });
    } catch (error) {
      console.error("Submit reflection error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
