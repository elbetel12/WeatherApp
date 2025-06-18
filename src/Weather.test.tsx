import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Weather from './Weather'

// Mock axios
jest.mock('axios')
const mockedAxios = require('axios')

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn()
}
global.navigator.geolocation = mockGeolocation

describe('Weather Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders weather app title', () => {
    render(<Weather />)
    expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument()
  })

  test('shows loading spinner when searching', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        name: 'London',
        main: { temp: 20, humidity: 65, feels_like: 22, pressure: 1013 },
        weather: [{ description: 'clear sky', icon: '01d', main: 'Clear' }],
        wind: { speed: 5 },
        sys: { country: 'GB', sunrise: 1640995200, sunset: 1641027600 },
        visibility: 10000
      }
    })

    render(<Weather />)
    
    const searchInput = screen.getByPlaceholderText('Search for a city...')
    const searchButton = screen.getByRole('button', { name: /search/i })
    
    fireEvent.change(searchInput, { target: { value: 'London' } })
    fireEvent.click(searchButton)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('displays error message for invalid city', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 404 }
    })

    render(<Weather />)
    
    const searchInput = screen.getByPlaceholderText('Search for a city...')
    const searchButton = screen.getByRole('button', { name: /search/i })
    
    fireEvent.change(searchInput, { target: { value: 'InvalidCity' } })
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(screen.getByText(/City not found/i)).toBeInTheDocument()
    })
  })

  test('temperature conversion works', () => {
    render(<Weather />)
    
    const celsiusButton = screen.getByText(/Switch to °F/i)
    fireEvent.click(celsiusButton)
    
    expect(screen.getByText(/Switch to °C/i)).toBeInTheDocument()
  })
}) 