import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import {
  Button,
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';

import { TextField } from '@material-ui/core';

export const OpenInGitpodComponent = () => (
  <Page themeId="tool">
    <Header
      title="Welcome to Gitpod!"
      subtitle="Cloud Development Environment with Gitpod"
    >
      <HeaderLabel label="Owner" value="Gitpod" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="Gitpod Backstage Plugin">
        <SupportButton>Contact Us For Help</SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard title="Enter any Git Repository URL">
            <Typography variant="body1">
              Supports GitLab, GitHub, BitBucket.
            </Typography>
          </InfoCard>
        </Grid>
        <Grid item>
          {/*
           * TODO: Pass the TextField data to Button URL
           */}
          <TextField
            id="outlined-basic"
            label="Git Repository URL"
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            to="https://gitpod.io/#${repoUrl}"
            className="gitpod-button"
            style={{ marginLeft: '10px', marginTop: '8px' }}
          >
            Open in Gitpod
          </Button>
        </Grid>
      </Grid>
    </Content>
  </Page>
);
