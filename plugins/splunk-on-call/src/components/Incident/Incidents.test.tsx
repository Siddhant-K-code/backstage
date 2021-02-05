/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Incidents } from './Incidents';
import { wrapInTestApp } from '@backstage/test-utils';
import {
  ApiProvider,
  ApiRegistry,
  IdentityApi,
  identityApiRef,
} from '@backstage/core';
import { splunkOnCallApiRef } from '../../api';
import { Incident, Team } from '../types';

const MOCK_INCIDENT: Incident = {
  alertCount: 1,
  currentPhase: 'ACKED',
  entityDisplayName: 'test-incident',
  entityId: 'entityId',
  entityState: 'CRITICAL',
  entityType: 'SERVICE',
  incidentNumber: '1',
  lastAlertId: 'lastAlertId',
  lastAlertTime: '2021-02-03T00:13:11Z',
  routingKey: 'routingdefault',
  service: 'test',
  startTime: '2021-02-03T00:13:11Z',
  pagedTeams: ['team-O9SqT13fsnCstjMi'],
  pagedUsers: [],
  pagedPolicies: [
    {
      policy: {
        name: 'Generated Direct User Policy for test',
        slug: 'directUserPolicySlug-test',
        _selfUrl: '/test',
      },
    },
  ],
  transitions: [{ name: 'ACKED', at: '2021-02-03T01:20:00Z', by: 'test' }],
  monitorName: 'vouser-user',
  monitorType: 'Manual',
  firstAlertUuid: 'firstAlertUuid',
  incidentLink: 'https://portal.victorops.com/example',
};

const MOCK_TEAM: Team = {
  _selfUrl: '/api-public/v1/team/team-O9SqT13fsnCstjMi',
  _membersUrl: '/api-public/v1/team/team-O9SqT13fsnCstjMi/members',
  _policiesUrl: '/api-public/v1/team/team-O9SqT13fsnCstjMi/policies',
  _adminsUrl: '/api-public/v1/team/team-O9SqT13fsnCstjMi/admins',
  name: 'test',
  slug: 'team-O9SqT13fsnCstjMi',
  memberCount: 1,
  version: 1,
  isDefaultTeam: false,
};

const mockIdentityApi: Partial<IdentityApi> = {
  getUserId: () => 'test',
};

const mockSplunkOnCallApi = {
  getIncidents: () => [],
  getTeams: () => [],
};
const apis = ApiRegistry.from([
  [identityApiRef, mockIdentityApi],
  [splunkOnCallApiRef, mockSplunkOnCallApi],
]);

describe('Incidents', () => {
  it('Renders an empty state when there are no incidents', async () => {
    mockSplunkOnCallApi.getTeams = jest
      .fn()
      .mockImplementationOnce(async () => [MOCK_TEAM]);

    const { getByText, queryByTestId } = render(
      wrapInTestApp(
        <ApiProvider apis={apis}>
          <Incidents refreshIncidents={false} team="test" />
        </ApiProvider>,
      ),
    );
    await waitFor(() => !queryByTestId('progress'));
    expect(getByText('Nice! No incidents found!')).toBeInTheDocument();
  });

  it('Renders all incidents', async () => {
    mockSplunkOnCallApi.getIncidents = jest
      .fn()
      .mockImplementationOnce(async () => [MOCK_INCIDENT]);

    mockSplunkOnCallApi.getTeams = jest
      .fn()
      .mockImplementationOnce(async () => [MOCK_TEAM]);
    const {
      getByText,
      getByTitle,
      getAllByTitle,
      getByLabelText,
      queryByTestId,
    } = render(
      wrapInTestApp(
        <ApiProvider apis={apis}>
          <Incidents team="test" refreshIncidents={false} />
        </ApiProvider>,
      ),
    );
    await waitFor(() => !queryByTestId('progress'));
    expect(getByText('user')).toBeInTheDocument();
    expect(getByText('test-incident')).toBeInTheDocument();
    expect(getByTitle('ACKED')).toBeInTheDocument();
    expect(getByLabelText('Status warning')).toBeInTheDocument();

    // assert links, mailto and hrefs, date calculation
    expect(getAllByTitle('View in Splunk On-Call').length).toEqual(1);
  });

  it('Handle errors', async () => {
    mockSplunkOnCallApi.getIncidents = jest
      .fn()
      .mockRejectedValueOnce(new Error('Error occurred'));

    const { getByText, queryByTestId } = render(
      wrapInTestApp(
        <ApiProvider apis={apis}>
          <Incidents team="test" refreshIncidents={false} />
        </ApiProvider>,
      ),
    );
    await waitFor(() => !queryByTestId('progress'));
    expect(
      getByText('Error encountered while fetching information. Error occurred'),
    ).toBeInTheDocument();
  });
});
