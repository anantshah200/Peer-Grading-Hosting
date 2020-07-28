module.exports = (sequelize, Sequelize) => {
  const Assignment_Submissions = sequelize.define("assignment_submissions", {
    s3link: {
      type: Sequelize.STRING,
    },
    canvas_id: {
      type: Sequelize.STRING,
    },
  });
  Assignment_Submissions.associate = (db) => {
    Assignment_Submissions.belongsTo(db.groups, {
      foreignKey: "groupId",
    });
    Assignment_Submissions.belongsTo(db.assignments, {
      foreignKey: "assignmentId",
    });

    Assignment_Submissions.hasMany(db.submission_grades);
    Assignment_Submissions.hasMany(db.submission_reports);
    Assignment_Submissions.hasMany(db.review_reports);
    Assignment_Submissions.hasMany(db.peer_matchings);
  };
  return Assignment_Submissions;
};
