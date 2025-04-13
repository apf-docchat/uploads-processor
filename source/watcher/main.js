const path = require('path');
const chokidar = require('chokidar');
const {
  getDetailsFromPath,
  notifyVectorizerAdded,
  notifyVectorizerRemoved,
  notifyBackendAdded,
  notifyBackendRemoved,
  notifyPopulateGeneralMetadataAdded
} = require("./lib");

const watchPath = path.resolve(process.env.UPLOADS_BASE_DIR || path.join(path.sep, 'uploads'));

function ignoreHandler(filePath, stats) {
  const allowedExtensions = ['pdf', 'docx', 'txt'];

  if (stats?.isFile()) {
    const fileExtension = path.extname(filePath).slice(1);
    return !allowedExtensions.includes(fileExtension);
  }
  return false;
}

const watcher = chokidar.watch(watchPath, {
  persistent: true,
  ignored: ignoreHandler,
  depth: 1,
  ignoreInitial: true,
  followSymlinks: false,
  ignorePermissionErrors: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

// Event listeners
watcher
  .on('add', path => {
    console.log(`File ${path} was added`)
    const {orgId, filename} = getDetailsFromPath(path);
    notifyVectorizerAdded(orgId, filename);
    notifyBackendAdded(orgId, filename);
    notifyPopulateGeneralMetadataAdded(orgId, filename);
  })
  .on('change', path => {
    console.log(`File ${path} was changed`)
    const {orgId, filename} = getDetailsFromPath(path);
    notifyVectorizerAdded(orgId, filename);
  })
  .on('unlink', path => {
    console.log(`File ${path} was removed`)
    const {orgId, filename} = getDetailsFromPath(path);
    notifyVectorizerRemoved(orgId, filename);
    notifyBackendRemoved(orgId, filename);
  })
  .on('ready', () => {
    console.log(`Watcher ready and watching ${watchPath}`)
  })
  .on('error', error => console.log(`Watcher error: ${error}`));
