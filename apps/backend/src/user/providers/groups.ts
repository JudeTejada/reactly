// Provider groups organized by domain

// Import provider classes
import { GetUserInternalIdProvider } from './queries/get-user-internal-id.provider';
import { GetUserByClerkIdProvider } from './queries/get-user-by-clerk-id.provider';
import { GetUserProjectsProvider } from './queries/get-user-projects.provider';
import { CheckProjectOwnershipProvider } from './authorization/check-project-ownership.provider';
import { UpsertUserFromClerkProvider } from './auth/upsert-user-from-clerk.provider';
import { DeleteUserProvider } from './auth/delete-user.provider';

// Import tokens
import {
  GET_USER_INTERNAL_ID,
  GET_USER_BY_CLERK_ID,
  GET_USER_PROJECTS,
  CHECK_PROJECT_OWNERSHIP,
  UPSERT_USER_FROM_CLERK,
  DELETE_USER,
} from './tokens';

// Domain-specific provider arrays
export const queryProviders = [
  {
    provide: GET_USER_INTERNAL_ID,
    useClass: GetUserInternalIdProvider,
  },
  {
    provide: GET_USER_BY_CLERK_ID,
    useClass: GetUserByClerkIdProvider,
  },
  {
    provide: GET_USER_PROJECTS,
    useClass: GetUserProjectsProvider,
  },
];

export const authorizationProviders = [
  {
    provide: CHECK_PROJECT_OWNERSHIP,
    useClass: CheckProjectOwnershipProvider,
  },
];

export const authProviders = [
  {
    provide: UPSERT_USER_FROM_CLERK,
    useClass: UpsertUserFromClerkProvider,
  },
  {
    provide: DELETE_USER,
    useClass: DeleteUserProvider,
  },
];

// All providers for module registration
export const userProviders = [
  ...queryProviders,
  ...authorizationProviders,
  ...authProviders,
];