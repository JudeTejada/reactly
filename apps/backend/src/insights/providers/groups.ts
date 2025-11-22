import { EnqueueGenerateInsightsProvider } from './queue/enqueue-generate-insights.provider';
import { GetInsightsJobStatusProvider } from './queue/get-insights-job-status.provider';
import { CancelInsightsJobProvider } from './queue/cancel-insights-job.provider';

import { GetFeedbackForInsightsProvider } from './queries/get-feedback-for-insights.provider';
import { GetExistingInsightsProvider } from './queries/get-existing-insights.provider';

import { SaveInsightsProvider } from './commands/save-insights.provider';

import {
  ENQUEUE_GENERATE_INSIGHTS,
  GET_INSIGHTS_JOB_STATUS,
  CANCEL_INSIGHTS_JOB,
  GET_FEEDBACK_FOR_INSIGHTS,
  GET_EXISTING_INSIGHTS,
  SAVE_INSIGHTS,
} from './tokens';

export const queueProviders = [
  {
    provide: ENQUEUE_GENERATE_INSIGHTS,
    useClass: EnqueueGenerateInsightsProvider,
  },
  {
    provide: GET_INSIGHTS_JOB_STATUS,
    useClass: GetInsightsJobStatusProvider,
  },
  {
    provide: CANCEL_INSIGHTS_JOB,
    useClass: CancelInsightsJobProvider,
  },
];

export const queryProviders = [
  {
    provide: GET_FEEDBACK_FOR_INSIGHTS,
    useClass: GetFeedbackForInsightsProvider,
  },
  {
    provide: GET_EXISTING_INSIGHTS,
    useClass: GetExistingInsightsProvider,
  },
];

export const commandProviders = [
  {
    provide: SAVE_INSIGHTS,
    useClass: SaveInsightsProvider,
  },
];

export const insightsProviders = [
  ...queueProviders,
  ...queryProviders,
  ...commandProviders,
];
