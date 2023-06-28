const axios = require('axios');
const base = require('./airtableIntegration');

const clientId = 'b6a28d3f0b2a4f34af85d5ccb32214f5';
const clientSecret = '2cdf873ecf324d389668879da0f9c8b5';

const tokenEndpoint = 'https://accounts.spotify.com/api/token';
const requestBody = new URLSearchParams();
requestBody.append('grant_type', 'client_credentials');
requestBody.append('client_id', clientId);
requestBody.append('client_secret', clientSecret);

axios
  .post(tokenEndpoint, requestBody)
  .then(response => {
    const accessToken = response.data.access_token;
    console.log('Access Token:', accessToken);

    const artistId = '0xOeVMOz2fVg5BJY3N6akT'; // Replace with the specific artist ID you want to retrieve data for

    // Make a request to the Spotify API to get the artist data
    axios
      .get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      .then(artistResponse => {
        const artistData = artistResponse.data;
        console.log('Artist Data:', artistData);

        // Extract the required data from the artist response
        const { id, followers, name, popularity, uri } = artistData;

        // Create a timestamp
        const timestamp = new Date().toISOString();

        // Populate the fields with the retrieved data and timestamp
        const fields = {
          'id': id,
          'followers': followers.total,
          'name': name,
          'popularity': popularity,
          'uri': uri,
          'timestamp': timestamp,
          // Add more fields as needed
        };

        // Create a record with the specified field values in Airtable
        base('SpotifyMetrics').create(
          [
            {
              fields,
            },
          ],
          function (err, records) {
            if (err) {
              console.error('Error creating record in Airtable:', err);
              return;
            }
            console.log('Record created in Airtable:', records);

            // Fetch monthly listeners from Spotify Artist Monthly Listeners API
            const listenersApiUrl = 'https://spotify-artist-monthly-listeners.p.rapidapi.com/listeners';
            const config = {
              headers: {
                'X-RapidAPI-Key': '659a6a8680msh006d91b1c5d2c83p17c1c5jsn14f1a07c38ab',
                'X-RapidAPI-Host': 'spotify-artist-monthly-listeners.p.rapidapi.com',
              },
              params: {
                artistId: artistId,
              },
            };

            axios
              .get(listenersApiUrl, config)
              .then(response => {
                const monthlyListeners = response.data.monthlyListeners;
                console.log('Monthly Listeners:', monthlyListeners);

                // Update the existing Airtable record with the monthly listeners data
                const recordId = records[0].id; // Assuming only one record is created
                base('SpotifyMetrics').update(
                  recordId,
                  {
                    'monthly listeners': monthlyListeners,
                    // Update other fields as needed
                  },
                  function (err, updatedRecord) {
                    if (err) {
                      console.error('Error updating record in Airtable:', err);
                      return;
                    }
                    console.log('Record updated in Airtable:', updatedRecord);
                  }
                );
              })
              .catch(error => {
                console.error('Error retrieving monthly listeners:', error);
              });
          }
        );
      })
      .catch(error => {
        console.error('Error retrieving artist data:', error);
      });
  })
  .catch
