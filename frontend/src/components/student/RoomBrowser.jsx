import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Grid, Card, CardMedia, CardContent, 
  CardActions, Button, Chip, TextField, InputAdornment, MenuItem, 
  Select, FormControl, InputLabel, Slider, Divider, Skeleton, Fade
} from '@mui/material';
import { 
  Search, FilterList, Bed, AttachMoney, LocationOn, 
  MeetingRoom, Person, Wc
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../../services/api';
import './RoomBrowser.css';

const RoomBrowser = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    priceRange: [0, 500000],
    gender: 'all',
    capacity: 'all'
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await roomService.getAvailableRooms();
      setRooms(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      // For demo purposes, set mock rooms if API fails
      setRooms([
        { _id: '1', roomNumber: 'A101', blockName: 'Block A', capacity: 2, price: 150000, genderRestriction: 'Male', amenities: ['AC', 'WiFi', 'Ensuite'], images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000'] },
        { _id: '2', roomNumber: 'B205', blockName: 'Block B', capacity: 4, price: 100000, genderRestriction: 'Female', amenities: ['WiFi', 'Kitchenette'], images: ['https://images.unsplash.com/photo-1522771731514-6019b8e22194?auto=format&fit=crop&q=80&w=1000'] },
        { _id: '3', roomNumber: 'C302', blockName: 'Block C', capacity: 1, price: 250000, genderRestriction: 'Any', amenities: ['AC', 'WiFi', 'Ensuite', 'TV'], images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1000'] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(filters.search.toLowerCase()) || 
                          room.blockName.toLowerCase().includes(filters.search.toLowerCase());
    const matchesPrice = room.price >= filters.priceRange[0] && room.price <= filters.priceRange[1];
    const matchesGender = filters.gender === 'all' || room.genderRestriction === filters.gender || room.genderRestriction === 'Any';
    const matchesCapacity = filters.capacity === 'all' || room.capacity.toString() === filters.capacity;
    
    return matchesSearch && matchesPrice && matchesGender && matchesCapacity;
  });

  return (
    <Container maxWidth="xl" className="room-browser-container">
      <Box sx={{ mb: 4, pt: 4 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#1a237e' }}>
          Find Your Perfect Room
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Browse through our modern and comfortable accommodations tailored for students.
        </Typography>
      </Box>

      {/* Filters Section */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search by block or room..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography gutterBottom variant="caption" color="text.secondary">Price Range (₦)</Typography>
            <Slider
              value={filters.priceRange}
              onChange={(e, newVal) => handleFilterChange('priceRange', newVal)}
              valueLabelDisplay="auto"
              min={50000}
              max={500000}
              step={10000}
              size="small"
              sx={{ color: '#6366F1' }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                value={filters.gender}
                label="Gender"
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Male">Male Only</MenuItem>
                <MenuItem value="Female">Female Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Capacity</InputLabel>
              <Select
                value={filters.capacity}
                label="Capacity"
                onChange={(e) => handleFilterChange('capacity', e.target.value)}
              >
                <MenuItem value="all">All Sizes</MenuItem>
                <MenuItem value="1">Single (1)</MenuItem>
                <MenuItem value="2">Double (2)</MenuItem>
                <MenuItem value="3">Triple (3)</MenuItem>
                <MenuItem value="4">Quad (4)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<FilterList />}
              onClick={() => setFilters({ search: '', priceRange: [0, 500000], gender: 'all', capacity: 'all' })}
              sx={{ borderRadius: 2 }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Room Grid */}
      <Grid container spacing={4}>
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" typography="h5" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="80%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : filteredRooms.length === 0 ? (
          <Grid item xs={12}>
            <Box textAlign="center" py={10}>
              <MeetingRoom sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h5" color="text.secondary">No rooms found matching your criteria</Typography>
              <Button sx={{ mt: 2 }} variant="text" onClick={() => setFilters({ search: '', priceRange: [0, 500000], gender: 'all', capacity: 'all' })}>
                Clear Filters
              </Button>
            </Box>
          </Grid>
        ) : (
          filteredRooms.map((room) => (
            <Fade in={true} key={room._id} timeout={800}>
              <Grid item xs={12} sm={6} md={4}>
                <Card className="room-card" sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.12)'
                  }
                }}>
                  <Box position="relative">
                    <CardMedia
                      component="img"
                      height="220"
                      image={room.images?.[0] || 'https://via.placeholder.com/400x250?text=No+Image'}
                      alt={`Room ${room.roomNumber}`}
                      sx={{ filter: 'brightness(0.9)' }}
                    />
                    <Chip 
                      label={room.capacity === 1 ? 'Premium Single' : `${room.capacity} Sharing`}
                      color={room.capacity === 1 ? 'secondary' : 'primary'}
                      sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 'bold' }}
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h5" fontWeight="700">
                        {room.roomNumber}
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight="600">
                        ₦{room.price.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" mb={2}>
                      <LocationOn fontSize="small" sx={{ mr: 0.5 }} /> {room.blockName} Block
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6} display="flex" alignItems="center">
                        <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">Cap: {room.capacity}</Typography>
                      </Grid>
                      <Grid item xs={6} display="flex" alignItems="center">
                        <Wc fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{room.genderRestriction}</Typography>
                      </Grid>
                    </Grid>

                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {room.amenities?.slice(0, 3).map((amenity, idx) => (
                        <Chip key={idx} label={amenity} size="small" variant="outlined" />
                      ))}
                      {room.amenities?.length > 3 && (
                        <Chip label={`+${room.amenities.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary" 
                      disableElevation
                      onClick={() => navigate(`/rooms/${room._id}`)}
                      sx={{ 
                        borderRadius: 2, 
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      View Details & Apply
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Fade>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default RoomBrowser;
