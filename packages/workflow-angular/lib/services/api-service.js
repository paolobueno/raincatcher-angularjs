var CONSTANTS = require('../constants');
var wfm = require('@raincatcher/wfm');
var Promise = require('bluebird');

function WorkflowApiService(config) {
  this.processInstanceRepository = config.workordersRepository;
  this.processRepository = config.workflowsRepository;

  // Holds an wfm.Executor for each ProcessInstance?
  this.executors = {};
}

/**
 * Listing All Workflows
 * @returns {Promise}
 */
WorkflowApiService.prototype.listWorkflows = function() {
  return this.processRepository.getAll();
};

/**
 * Listing all workorders
 *
 * @returns {Promise}
 */
WorkflowApiService.prototype.listWorkorders = function() {
  return this.processInstanceRepository.getAll();
};


/**
 * Reading A single workflow
 *
 * @param {string} workflowId
 * @returns {Promise}
 */
WorkflowApiService.prototype.readWorkflow = function(workflowId) {
  return this.processRepository.getById(workflowId);
};

/**
 * Reading A single workorder
 *
 * @param {string} workorderId
 * @returns {Promise}
 */
WorkflowApiService.prototype.readWorkorder = function(workorderId) {
  return this.processInstanceRepository.getById(workorderId);
};

/**
 *
 * Updating A Single Workflow
 *
 * @param {object} workflowToUpdate - The Workflow To Update
 * @param {string} workflowToUpdate.id - The ID of the Workorder To Update
 * @returns {Promise}
 */
WorkflowApiService.prototype.updateWorkflow = function(workflowToUpdate) {
  return this.processRepository.update(workflowToUpdate);
};


/**
 *
 * Creating A Single Workflow
 *
 * @param {object} workflowToCreate - The Workflow To Create
 * @returns {Promise}
 */
WorkflowApiService.prototype.createWorkflow = function(workflowToCreate) {
  return this.processRepository.create(workflowToCreate);
};

/**
 *
 * Removing A Single Workorder
 *
 * @param {object} workflowToRemove - The Workorder To Remove
 * @param {string} workflowToRemove.id - The ID of the workorder to remove.
 * @returns {Promise}
 */
WorkflowApiService.prototype.removeWorkflow = function(workflowToRemove) {
  return this.processRepository.delete(workflowToRemove);
};

/**
 *
 * Beginning a workflow for a single workorder.
 *
 * @param {string} workorderId - The ID of the workorder to begin the workflow for.
 */
WorkflowApiService.prototype.beginWorkflow = function(workorderId) {
  //get workflow id
  var processData = this.processRepository.getById(workorderId);
  var process = new wfm.ProcessImpl(processData.name, processData.tasks);
  var instanceHolder;
  var executorRepository = {
    saveInstance: function(instance) {
      instanceHolder = instance;
      return Promise.resolve(instanceHolder);
    }
  };
  this.executor = new wfm.ExecutorImpl(process, executorRepository);
};

/**
 *
 * Getting a summary of the workorder. This will get all of the details related to the workorder, including workflow and result data.
 *
 * @param {string} workorderId - The ID of the workorder to get the summary for.
 */
WorkflowApiService.prototype.workflowSummary = function(workorderId) {
  var executor = this.executors[workorderId];
  if (!executor) {
    return Promise.reject(new Error('Workorder not initiated'));
  }
  return this.executorRepository.getSummary().then(function(wfmSummary) {
    // map wfm summary fields to fields expected by UI
    return {
      workorder: wfmSummary.ProcessInstance,
      workflow: wfmSummary.Process,
      status: wfmSummary.Process.getAggregateStatus(),
      nextStepIndex: wfmSummary.ProcessInstance.currentTaskIndex,
      result: {} // TODO
    };
  });
};


/**
 *
 * Going to the previous step of a workorder.
 *
 * @param {string} workorderId - The ID of the workorder to switch to the previous step for
 */
WorkflowApiService.prototype.previousStep = function(workorderId) {
  return this.executor.movePrevious();
};

/**
 * TODO this will be actual step implementation
 *
 * Going to the next step of a workorder.
 *
 * @param {string} workorderId - The ID of the workorder to switch to next step
 * @returns {Promise}
 */
WorkflowApiService.prototype.nextStepSubscriber = function(subscriberFunction) {

};

/**
 *
 * TODO this will be actual step implementation
 *
 * Going to the next step of a workorder.
 *
 * @param {string} workorderId - The ID of the workorder to switch to next step
 * @returns {Promise}
 */
WorkflowApiService.prototype.previousStepSubscriber = function(subscriberFunction) {

};

/**
 *
 * Completing a single step for a workorder.
 *
 * @param parameters
 * @param {string} parameters.workorderId - The ID of the workorder to complete the step for
 * @param {string} parameters.submission - The submission to save
 * @param {string} parameters.stepCode - The ID of the step to save the submission for
 */
WorkflowApiService.prototype.completeStep = function(parameters) {
  return this.executors[parameters.workorderId].moveNext(parameters.submission);
};

angular.module(CONSTANTS.WORKFLOW_DIRECTIVE_MODULE).service(CONSTANTS.WORKFLOW_API_SERVICE, ['WORKFLOW_CONFIG', function(WORKFLOW_CONFIG) {
  return new WorkflowApiService(WORKFLOW_CONFIG);
}]);
