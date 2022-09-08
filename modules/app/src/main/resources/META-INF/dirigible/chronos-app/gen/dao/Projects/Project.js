const query = require("db/v4/query");
const producer = require("messaging/v4/producer");
const daoApi = require("db/v4/dao");
const EntityUtils = require("chronos-app/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CHRONOS_PROJECT",
	properties: [
		{
			name: "Id",
			column: "PROJECT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "PROJECT_NAME",
			type: "VARCHAR",
		},
 {
			name: "Start",
			column: "PROJECT_START",
			type: "DATE",
		},
 {
			name: "End",
			column: "PROJECT_END",
			type: "DATE",
		},
 {
			name: "EmployeeId",
			column: "PROJECT_EMPLOYEEID",
			type: "INTEGER",
		},
 {
			name: "ProjectStatusId",
			column: "PROJECT_PROJECTSTATUSID",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Start");
		EntityUtils.setDate(e, "End");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Start");
	EntityUtils.setDate(entity, "End");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Start");
	EntityUtils.setLocalDate(entity, "End");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CHRONOS_PROJECT",
		key: {
			name: "Id",
			column: "PROJECT_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "Start");
	// EntityUtils.setLocalDate(entity, "End");
	dao.update(entity);
	triggerEvent("Update", {
		table: "CHRONOS_PROJECT",
		key: {
			name: "Id",
			column: "PROJECT_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CHRONOS_PROJECT",
		key: {
			name: "Id",
			column: "PROJECT_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM CHRONOS_PROJECT");
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(operation, data) {
	producer.queue("chronos-app/Projects/Project/" + operation).send(JSON.stringify(data));
}