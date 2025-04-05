import Email from "../models/email.models.js"; // don't forget `.js` at the end

export const getEmails = async (page = 1, limit = 10, search = "") => {
  const query = search ? { title: new RegExp(search, "i") } : {};
  return await Email.find(query)
    .sort({ createdOn: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
};

export const getEmailById = async (id) => {
  return await Email.findById(id);
};

export const createEmail = async (emailData) => {
  const email = new Email(emailData);
  await email.save();
  return email;
};

export const updateEmail = async (id, emailData) => {
  return await Email.findByIdAndUpdate(id, emailData, { new: true });
};

export const deleteEmail = async (id) => {
  await Email.findByIdAndDelete(id);
  return { message: "Email design deleted" };
};
