# RiccoRide - Cab Service Management Tool

A simple, web-based data entry and management system for cab service businesses. Built with HTML, CSS, and JavaScript - no database required!

## 🚀 Features

### ✅ Trip Management
- **Add New Trips** with complete details
- **Trip Types**: Company, Individual, Outsource
- **Route Management**: Local and Outstation trips
- **Vehicle Assignment**: Own vehicles or manual entry for outsourced
- **Driver Assignment**: From your driver database
- **Cost Tracking**: Fuel, driver costs, maintenance, tolls
- **Payment Tracking**: Multiple payment methods
- **Company Trips**: Special fields for start/end times, total days

### ✅ Master Data Management
- **Vehicles**: Add/edit vehicles with fuel type, status tracking
- **Drivers**: Manage driver information, licenses, status
- **Companies**: Maintain company contacts and details
- **Vendors**: Track commission-based vendor relationships

### ✅ Analytics & Reports
- **Dashboard**: Real-time stats for today's trips, monthly revenue/profit
- **Summary Reports**: Financial breakdown with profit calculations
- **Monthly Analysis**: Month-by-month performance tracking
- **Vehicle Performance**: Trip counts, revenue, profit by vehicle
- **Company Analysis**: Performance metrics for each company client
- **Detailed Trip Reports**: Complete trip listing with export to CSV

### ✅ Data Management
- **Local Storage**: No database needed - works completely offline
- **Data Export**: Backup your data as JSON files
- **Data Import**: Restore from previous backups
- **CSV Export**: Export trip reports for further analysis

## 🎯 Quick Start

1. **Download the RiccoRide-Tool folder**
2. **Open `index.html` in your web browser**
3. **Start using immediately!**

No installation, no setup, no internet required.

## 📱 How to Use

### First Time Setup
1. Go to **Manage Data** tab
2. Add your vehicles in the **Vehicles** section
3. Add your drivers in the **Drivers** section
4. Add companies (if you have corporate clients)
5. Add vendors (if you work with external vehicle providers)

### Adding Trips
1. Click **Add Trip** from dashboard or navigation
2. Fill in all trip details:
   - Date, route, distance
   - Select vehicle and driver
   - Enter costs (fuel, driver payment, etc.)
   - Enter payment received
3. For **Company trips**: Additional fields for start/end times, toll costs
4. For **Outsource trips**: Use manual vehicle entry and select vendor
5. Click **Calculate Profit** to see trip profitability before saving
6. Click **Save Trip**

### Viewing Reports
1. Go to **Reports** tab
2. Set date filters to analyze specific periods
3. View different report types:
   - **Summary**: Overall financial performance
   - **Monthly**: Month-by-month trends
   - **Vehicle Performance**: Which vehicles are most profitable
   - **Company Analysis**: Which companies provide best business
   - **Detailed Trips**: Complete trip listing with export option

### Data Backup
- **Export**: Click "Export All Data" in Manage Data to download backup
- **Import**: Use "Import Data" to restore from a backup file

## 💡 Pro Tips

### For Daily Use
- **Quick Entry**: Bookmark the "Add Trip" page for fastest access
- **Today's Summary**: Check dashboard daily for today's trip count and earnings
- **Profit Check**: Use "Calculate Profit" before saving trips to ensure profitability

### For Monthly Review
- Use **Reports > Monthly Analysis** to track business growth
- Check **Vehicle Performance** to identify your most profitable vehicles
- Review **Company Analysis** to focus on best-paying clients

### For Business Growth
- Track **individual vs company vs outsource** trip profitability
- Monitor **fuel cost trends** across different vehicles
- Analyze **driver performance** by reviewing their trip assignments

## 🔧 Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser LocalStorage (JSON format)
- **Compatibility**: Works on all modern browsers
- **Responsive**: Mobile-friendly design
- **Offline**: No internet connection required

## 📊 Data Structure

All data is stored locally in your browser as JSON. The system tracks:
- **Trips**: All trip details with financial calculations
- **Vehicles**: Vehicle information and status
- **Drivers**: Driver details and contact info
- **Companies**: Corporate client information
- **Vendors**: External service provider details

## 🔄 Upgrading to Database Later

When your business grows, this tool's data can easily be migrated to:
- MySQL database
- PostgreSQL
- Cloud-based solutions
- Mobile apps

The JSON export feature ensures you never lose your data during transitions.

## 🆘 Need Help?

### Common Tasks
- **Adding your first trip**: Manage Data → Add vehicles/drivers first → Add Trip
- **Monthly profit calculation**: Reports → Set month filter → View Summary Report
- **Backup your data**: Manage Data → Export All Data
- **View best performing vehicle**: Reports → Vehicle Performance tab

### Troubleshooting
- **Data not saving**: Check if browser allows local storage
- **Cannot see trips**: Check date filters in Reports section
- **Export not working**: Ensure browser allows file downloads

---

**Perfect for small to medium cab service businesses looking for a simple, effective management tool without the complexity of expensive software!**