import User from './tables/users';
import Icon from './tables/icons';
import Log from './tables/logs';
import Project from './tables/projects';
import Repo from './tables/repositories';
import { seq, Seq } from './tables/_db';
import { versionTools } from '../helpers/utils';

const version = {
  type: Seq.INTEGER,
  allowNull: false,
  primaryKey: true,
  get() {
    return versionTools.n2v(this.getDataValue('version'));
  },
  set(val) {
    this.setDataValue('version', versionTools.v2n(val));
  },
};

const ProjectVersion = seq.define('projectVersions', {
  version,
  projectId: {
    type: Seq.INTEGER,
    primaryKey: true,
    references: {
      model: Project,
      key: 'id',
    },
  },
  iconId: {
    type: Seq.INTEGER,
    primaryKey: true,
    references: {
      model: Icon,
      key: 'id',
    },
  },
});
const RepoVersion = seq.define('repoVersion', {
  version,
  iconId: {
    type: Seq.INTEGER,
    primaryKey: true,
    references: {
      model: Icon,
      key: 'id',
    },
  },
  repositoryId: {
    type: Seq.INTEGER,
    primaryKey: true,
    references: {
      model: Repo,
      key: 'id',
    },
  },
});

const UserProject = seq.define('userProject');
const UserLog = seq.define('userLog', {
  unread: {
    type: Seq.BOOLEAN,
    default: true,
  },
});

// 两边都写一下对应关系，以便添加 dao 方法
Icon.hasOne(Icon, { as: 'oldIcon', foreignKey: 'oldId', constraints: false });
Icon.hasOne(Icon, { as: 'newIcon', foreignKey: 'newId', constraints: false });
Icon.belongsToMany(Repo, {
  through: {
    model: RepoVersion,
    unique: false,
  },
  constraints: false,
});
Icon.belongsToMany(Project, {
  through: {
    model: ProjectVersion,
    unique: false,
  },
  constraints: false,
});

Repo.belongsToMany(Icon, {
  through: {
    model: RepoVersion,
    unique: false,
  },
  constraints: false,
});
Repo.belongsTo(User, { foreignKey: 'admin' });
Repo.hasMany(Log, {
  foreignKey: 'loggerId',
  constraints: false,
  scope: {
    scope: 'repo',
  },
});

Project.belongsToMany(Icon, {
  through: {
    model: ProjectVersion,
    unique: false,
  },
  constraints: false,
});
Project.hasMany(Log, {
  foreignKey: 'loggerId',
  constraints: false,
  scope: {
    scope: 'project',
  },
});
Project.belongsToMany(User, { through: UserProject });
Project.belongsTo(User, { foreignKey: 'owner', as: 'projectOwner' });

User.hasMany(Icon, { foreignKey: 'uploader' });
User.hasMany(Repo, { foreignKey: 'admin' });
User.hasMany(Log, { foreignKey: 'operator' });
User.hasMany(Project, { foreignKey: 'owner' });
User.belongsToMany(Project, { through: UserProject });

Log.belongsTo(User, {
  foreignKey: 'operator',
  as: 'logCreator',
});
Log.belongsToMany(User, { through: UserLog });
Log.belongsTo(Repo, {
  foreignKey: 'loggerId',
  constraints: false,
  as: 'repo',
});
Log.belongsTo(Project, {
  foreignKey: 'loggerId',
  constraints: false,
  as: 'project',
});

export { seq, Seq, User, Icon, Log, Project, Repo, RepoVersion, UserProject, ProjectVersion };

// 处理与数据库的连接情况
const force = { SYNC_FORCE: true, SYNC: false }[process.env.SEQUELIZE_SYNC];

if (typeof force === 'boolean') {
  seq
    .query('SET FOREIGN_KEY_CHECKS = 0')
    .then(() => seq.sync({ force }))
    .then(() => seq.query('SET FOREIGN_KEY_CHECKS = 1'));
}
