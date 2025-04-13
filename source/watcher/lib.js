const celery = require("celery-node");
const {v4: uuidv4} = require("uuid");
const path = require("path");
const axios = require("axios");

function getDetailsFromPath(filePath) {
  const pathParts = filePath.split(path.sep);
  const filename = pathParts[pathParts.length - 1];
  const orgId = pathParts[pathParts.length - 2];

  return {
    filename,
    orgId
  }
}

function notifyVectorizerAdded(orgId, filename) {
  console.info(`Notifying vectorizer to add: ${JSON.stringify({orgId, filename})}`);

  const celery_client = celery.createClient(process.env.VECTORIZER_TASKS_CELERY_BROKER_URI, process.env.NOOP_CELERY_RESULT_BACKEND_URI, 'celery');

  celery_client.isReady().then(() => {
    const {headers, properties, body} = celery_client.createTaskMessage(uuidv4(), 'vectorize', [], {
      'source_type': 'local_file',
      'filename': filename,
      'org_id': orgId
    });

    celery_client.broker.publish(body, '', celery_client.conf.CELERY_QUEUE, headers, properties).then(() => {
      celery_client.disconnect().then();
    });
  });
}

function notifyVectorizerRemoved(orgId, filename) {
  console.info(`Notifying vectorizer to remove: ${JSON.stringify({orgId, filename})}`);

  const celery_client = celery.createClient(process.env.VECTORIZER_TASKS_CELERY_BROKER_URI, process.env.NOOP_CELERY_RESULT_BACKEND_URI, 'celery');

  celery_client.isReady().then(() => {
    const {headers, properties, body} = celery_client.createTaskMessage(uuidv4(), 'remove', [], {
      'source_type': 'local_file',
      'filename': filename,
      'org_id': orgId
    });

    celery_client.broker.publish(body, '', celery_client.conf.CELERY_QUEUE, headers, properties).then(() => {
      celery_client.disconnect().then();
    });
  });
}

function notifyBackendAdded(orgId, filename) {
  console.info(`Notifying backend to add: ${JSON.stringify({orgId, filename})}`);

  axios.post(
    `${process.env.PW_CORE_API_URL}/addfiles`,
    {
      org_name: orgId,
      filenames: [
        filename
      ]
    },
    {
      headers: {
        'X-Api-Key': process.env.PW_CORE_API_KEY
      }
    }
  ).then()
    .catch((error) => {
      console.error(error);
    });
}

function notifyBackendRemoved(orgId, filename) {
  console.info(`Notifying backend to remove: ${JSON.stringify({orgId, filename})}`);

  axios.post(
    `${process.env.PW_CORE_API_URL}/deletefiles`,
    {
      org_name: orgId,
      filenames: [
        filename
      ]
    },
    {
      headers: {
        'X-Api-Key': process.env.PW_CORE_API_KEY
      }
    }
  ).then()
    .catch((error) => {
      console.error(error);
    });
}

function notifyPopulateGeneralMetadataAdded(orgId, filename) {
  console.info(`Notifying PopulateGeneralMetadata to add: ${JSON.stringify({orgId, filename})}`);

  const celery_client = celery.createClient(process.env.VECTORIZER_TASKS_CELERY_BROKER_URI, process.env.NOOP_CELERY_RESULT_BACKEND_URI, 'celery');

  celery_client.isReady().then(() => {
    const {headers, properties, body} = celery_client.createTaskMessage(uuidv4(), 'populate_general_metadata', [], {
      'source_type': 'local_file',
      'filename': filename,
      'org_id': orgId
    });

    celery_client.broker.publish(body, '', celery_client.conf.CELERY_QUEUE, headers, properties).then(() => {
      celery_client.disconnect().then();
    });
  });
}

module.exports = {
  notifyVectorizerAdded,
  notifyVectorizerRemoved,
  notifyBackendAdded,
  notifyBackendRemoved,
  getDetailsFromPath,
  notifyPopulateGeneralMetadataAdded
}
