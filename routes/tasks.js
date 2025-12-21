const express = require("express");
const { body, validationResult } = require("express-validator");
const Task = require("../models/Task");
const { authenticateToken } = require("../middleware/auth");
const { getWeekStartDate, getWeekEndDate } = require("../utils/week");

const router = express.Router();

// Get current week tasks
router.get("/current-week", authenticateToken, async (req, res) => {
  try {
    const weekStart = getWeekStartDate();
    const weekEnd = getWeekEndDate();

    // Match weekStartDate by date only (ignore time portion)
    const startOfDay = new Date(weekStart);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(weekStart);
    endOfDay.setHours(23, 59, 59, 999);

    let task = await Task.findOne({
      userId: req.user._id,
      weekStartDate: { $gte: startOfDay, $lte: endOfDay },
    });

    // Don't create empty task documents - only return existing or null
    if (!task) {
      return res.json({
        task: {
          id: null,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          customTasks: [],
          screenTimeTarget: null,
          bodyMovement: false,
        },
      });
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
    console.error("Get current week tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create or update tasks for current week
router.post(
  "/current-week",
  authenticateToken,
  [
    body("customTasks").isArray().optional(),
    body("customTasks.*.target").notEmpty().withMessage("Target is required"),
    body("customTasks.*.input").notEmpty().withMessage("Input is required"),
    body("screenTimeTarget").isNumeric().optional(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { customTasks, screenTimeTarget } = req.body;
      const weekStart = getWeekStartDate();
      const weekEnd = getWeekEndDate();

      // Validate that we have at least one task or a screen time target
      const hasCustomTasks =
        customTasks && Array.isArray(customTasks) && customTasks.length > 0;
      const hasScreenTime =
        screenTimeTarget !== undefined && screenTimeTarget !== null;

      if (!hasCustomTasks && !hasScreenTime) {
        return res
          .status(400)
          .json({
            message: "At least one task or screen time target is required",
          });
      }

      const startOfDay = new Date(weekStart);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(weekStart);
      endOfDay.setHours(23, 59, 59, 999);

      let task = await Task.findOne({
        userId: req.user._id,
        weekStartDate: { $gte: startOfDay, $lte: endOfDay },
      });

      if (task) {
        // Update existing task
        if (customTasks !== undefined) {
          task.customTasks = Array.isArray(customTasks) ? customTasks : [];
        }
        if (screenTimeTarget !== undefined) {
          task.screenTimeTarget =
            screenTimeTarget !== null ? screenTimeTarget : null;
        }
        task.updatedAt = new Date();
        await task.save();
      } else {
        task = new Task({
          userId: req.user._id,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          customTasks: hasCustomTasks ? customTasks : [],
          screenTimeTarget: hasScreenTime ? screenTimeTarget : null,
          bodyMovement: false, // Always false, not set in tasks page
        });
        await task.save();
      }

      res.json({
        message: "Tasks saved successfully",
        task: {
          id: task._id,
          weekStartDate: task.weekStartDate,
          weekEndDate: task.weekEndDate,
          customTasks: task.customTasks,
          screenTimeTarget: task.screenTimeTarget,
        },
      });
    } catch (error) {
      console.error("Save tasks error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update a specific custom task
router.put(
  "/custom-task/:taskIndex",
  authenticateToken,
  [
    body("target").notEmpty().withMessage("Target is required"),
    body("input").notEmpty().withMessage("Input is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskIndex } = req.params;
      const { target, input } = req.body;
      const weekStart = getWeekStartDate();

      const startOfDay = new Date(weekStart);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(weekStart);
      endOfDay.setHours(23, 59, 59, 999);

      const task = await Task.findOne({
        userId: req.user._id,
        weekStartDate: { $gte: startOfDay, $lte: endOfDay },
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const index = parseInt(taskIndex);
      if (index < 0 || index >= task.customTasks.length) {
        return res.status(400).json({ message: "Invalid task index" });
      }

      task.customTasks[index] = { target, input };
      task.updatedAt = new Date();
      await task.save();

      res.json({
        message: "Task updated successfully",
        task: task.customTasks[index],
      });
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete a custom task
router.delete(
  "/custom-task/:taskIndex",
  authenticateToken,
  async (req, res) => {
    try {
      const { taskIndex } = req.params;
      const weekStart = getWeekStartDate();

      const startOfDay = new Date(weekStart);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(weekStart);
      endOfDay.setHours(23, 59, 59, 999);

      const task = await Task.findOne({
        userId: req.user._id,
        weekStartDate: { $gte: startOfDay, $lte: endOfDay },
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const index = parseInt(taskIndex);
      if (index < 0 || index >= task.customTasks.length) {
        return res.status(400).json({ message: "Invalid task index" });
      }

      task.customTasks.splice(index, 1);
      task.updatedAt = new Date();
      await task.save();

      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
