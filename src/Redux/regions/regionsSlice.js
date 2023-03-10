import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getRegionPlayersAsync } from '../../Services/riotGamesAPI';

const regions = [
  'Europe',
  'Russia',
  'Brazil',
  'Japan',
  'Korea',
  'North America',
];

const getAllRegionPlayersType = 'leagueLeaderboard/regions/GET_REGIONS';

const generateProfilePicId = (start, end) => Math.floor((Math.random() * end - start) + start);

export const getAllRegionPlayersThunk = createAsyncThunk(getAllRegionPlayersType, async () => {
  const regionsData = await Promise.all(regions.map((region) => getRegionPlayersAsync(region)
    .then((data) => ({
      [region]: {
        ...data,
        entries: data.entries.filter((_, idx) => idx < 50).map((player) => ({
          ...player, profileId: generateProfilePicId(0, 62),
        })),
      },
    }))));

  const stats = {
    highestLeaguePoints: 0,
    highestWins: 0,
    highestWinrate: 0,
    playersAbove1000LP: 0,
    hotStreaks: 0,
    veterans: 0,
  };

  regionsData.forEach((region) => {
    Object.values(region)[0].entries.forEach((player) => {
      const playerWinrate = (player.wins * 100) / (player.wins + player.losses);
      if (player.wins > stats.highestWins) stats.highestWins = player.wins;
      if (playerWinrate >= stats.highestWinrate) stats.highestWinrate = playerWinrate.toFixed(2);
      if (player.leaguePoints >= 1000) stats.playersAbove1000LP += 1;
      if (player.hotStreak) stats.hotStreaks += 1;
      if (player.veteran) stats.veterans += 1;
      if (player.leaguePoints >= stats.highestLeaguePoints) {
        stats.highestLeaguePoints = player.leaguePoints;
      }
    });
  });

  return { ...stats, regions: regionsData };
});

const regionsSlice = createSlice({
  name: 'regions',
  initialState: null,
  extraReducers: (builder) => {
    builder.addCase(getAllRegionPlayersThunk.fulfilled, (_, action) => action.payload);
  },
});

export default regionsSlice.reducer;
