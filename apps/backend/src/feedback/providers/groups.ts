import { CreateFeedbackProvider } from './commands/create-feedback.provider';
import { UpdateFeedbackProvider } from './commands/update-feedback.provider';
import { DeleteFeedbackProvider } from './commands/delete-feedback.provider';
import { EnqueueFeedbackProvider } from './queue/enqueue-feedback.provider';
import { FindAllFeedbackProvider } from './queries/find-all-feedback.provider';
import { FindOneFeedbackProvider } from './queries/find-one-feedback.provider';
import { GetProjectProvider } from './queries/get-project.provider';

import {
  CREATE_FEEDBACK,
  UPDATE_FEEDBACK,
  DELETE_FEEDBACK,
  ENQUEUE_FEEDBACK,
  FIND_ALL_FEEDBACK,
  FIND_ONE_FEEDBACK,
  GET_PROJECT,
} from './tokens';

export const commandProviders = [
  {
    provide: CREATE_FEEDBACK,
    useClass: CreateFeedbackProvider,
  },
  {
    provide: UPDATE_FEEDBACK,
    useClass: UpdateFeedbackProvider,
  },
  {
    provide: DELETE_FEEDBACK,
    useClass: DeleteFeedbackProvider,
  },
];

export const queueProviders = [
  {
    provide: ENQUEUE_FEEDBACK,
    useClass: EnqueueFeedbackProvider,
  },
];

export const queryProviders = [
  {
    provide: FIND_ALL_FEEDBACK,
    useClass: FindAllFeedbackProvider,
  },
  {
    provide: FIND_ONE_FEEDBACK,
    useClass: FindOneFeedbackProvider,
  },
  {
    provide: GET_PROJECT,
    useClass: GetProjectProvider,
  },
];

export const feedbackProviders = [
  ...commandProviders,
  ...queueProviders,
  ...queryProviders,
];