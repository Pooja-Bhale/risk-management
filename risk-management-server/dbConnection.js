const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("postgres", "postgres", "root1234", {
  host: "fv-training-postgres-db.cceuus0qz7n7.ap-south-1.rds.amazonaws.com",
  dialect: "postgres",

  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

try {
  sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

// Employee table
const Employee = sequelize.define("Pooja_Employee", {
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cognitoId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
});

// Team table
const Team = sequelize.define("Pooja_Team", {
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  teamName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  threshold: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Leave table
const Leave = sequelize.define("Pooja_Leave", {
  leaveId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Pooja_Employees",
      key: "employeeId",
    },
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  days: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Approved",
  },
});
Leave.belongsTo(Employee, { foreignKey: "employeeId" });

// TeamMember table
const TeamMember = sequelize.define("Pooja_TeamMember", {
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Pooja_Employees",
      key: "employeeId",
    },
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Pooja_Teams", // table name
      key: "teamId", // field name
    },
  },
});


TeamMember.belongsTo(Employee, { foreignKey: "employeeId" });
TeamMember.belongsTo(Team, { foreignKey: "teamId" });

// TeamManager table
const TeamManager = sequelize.define("Pooja_TeamManager", {
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Pooja_Employees",
      key: "employeeId",
    },
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Pooja_Teams", // table name
      key: "teamId", // field name
    },
  },
});


TeamManager.belongsTo(Employee, { foreignKey: "employeeId" });
TeamManager.belongsTo(Team, { foreignKey: "teamId" });

Employee.sync();
Team.sync();
Leave.sync();
TeamMember.sync();
TeamManager.sync();

module.exports = { Employee, Team, Leave, TeamMember, TeamManager };
