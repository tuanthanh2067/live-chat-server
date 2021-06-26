const uniqid = require("uniqid");

const Notification = require("../models/Notification");
const { formatBufferTo64, cloudinaryUpload } = require("../helper/imageUpload");

exports.getNotifications = async (req, res) => {
  try {
    const amount = req.query.amount;
    const page = req.query.page;

    const notifications = await Notification.find({})
      .sort({ dateCreated: -1 })
      .limit(-amount)
      .skip(-amount * -page);

    if (!notifications) {
      return res.status(400).json({ errors: "No notifications found" });
    }

    return res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Problem getting notifications" });
  }
};

exports.addNotifications = async (req, res) => {
  try {
    const title = req.query.title;
    const description = req.query.description;
    const detail = req.query.detail;

    const user = req.user;

    if (!user) {
      return res.status(400).json({ errors: "User is not valid" });
    }

    if (user.role !== "admin") {
      return res
        .status(400)
        .json({ errors: "You're not authorized to add a notification" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ errors: "Can not upload the image, please try again" });
    }

    const file64 = formatBufferTo64(req.file);

    const uploadResult = await cloudinaryUpload(file64.content);

    const newNotification = new Notification({
      notificationId: uniqid(),
      title: title,
      description: description,
      detail: detail,
      image: uploadResult.secure_url,
    });

    await newNotification.save();

    return res
      .status(200)
      .json({ messages: "A new notification added successfully" });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ errors: "Problem adding notification" });
  }
};
