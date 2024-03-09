import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Router } from '@angular/router';

import Chart from 'chart.js/auto'; // Import Chart.js library


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'finalv3';
  @Input() processedData: any[] = [];
  dateHeaders: string[] = [];
  displayedColumns: string[] = [];
  additionalDates: string[] = [];
  isPopupOpen: boolean = false;
  selectedUser: any = null; // Track the selected user for the popup
  i: number = 0;
  editedDataMap: Map<string, any> = new Map<string, any>();
  totalAmountEntered: number = 0;
  remainingAmount: number = 0;
  amountToPay: number = 0;
  popupClass: string = '';
  // Add this property at the top of your ViewDataComponent class
filterSno: string = '';
filteredData: any[] = [];
filteredUser:any;
userInput: number=0;
originalData: any[] = [];
selectedDate: string = ''; // New property for selected date
selectedDayNumber: number | null = null; // Initialize with null to represent nothing selected
isAccountSectionOpen: boolean = false;
allAmountsToPay: number[] = [];
totalAmountForAllUsers: number = 0;
isPasswordVerified: boolean = false;
password: string = '';
passwordWrong: boolean = false;
expenseAmount: number = 0;
remainingTotalAfterExpenses: number = 0
originalProcessedData:any[]=[];
existingPDFData: any = null;
graphVisible: boolean = false; 
chart: Chart | null = null;
isDataOverviewPopupOpen: boolean = false;
isWeeklyCollectionPopupOpen: boolean = false;

selectedMonth: string = '';
selectedDayOfWeek: number = 3;
selectedDayOfWeekInput: string | null = null;
// Define weeklyCollectionsData as an array of objects with 'date' and 'amount' properties
weeklyCollectionsData: { date: string; amount: number; }[] = [];
amountsForAllUsers: { date: string; amount: number; }[][] = [];
months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
selectedMonthFilter: string = ''; // To store the selected month for filtering
selectedDateFilter: string = '';
filteredDates: string[] = []; // To store filtered dates based on selected month
selectedMonthData: { date: string; amount: number; }[] = [];
isRedUsersPopupOpen: boolean = false; // New property to control the visibility of the popup for red users
  redUsers: { name: string; sNo: number; }[] = []; // New property to store red users

  constructor(private changeDetectorRef: ChangeDetectorRef,private router: Router) {}

  ngOnInit(): void {
   
    this.originalProcessedData = this.processedData.slice();
    this.generateDateHeaders();
    this.calculateTotalAmount(); // Calculate remaining amount and amount to pay
    this.closeInstallmentsPopup();
   debugger;

  }
  

  openAllPopups(): void {
    this.originalProcessedData.forEach(user => {
      this.openInstallmentsPopups(user);
    });
  }
  verifyPassword(): void {
    if (this.password === '9121887158') {
      this.isPasswordVerified = true;
      this.passwordWrong = false; // Reset password wrong indicator
    } else {
      this.passwordWrong = true;
    }
  }
  
  
  generateDateHeaders() {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    const currentDate = new Date(startDate);

    if (this.selectedDayOfWeekInput) {
      this.selectedDayOfWeek = Number(this.selectedDayOfWeekInput);
    }

    this.dateHeaders = []; // Clear previous headers

    while (currentDate <= endDate) {
      if (currentDate.getDay() === this.selectedDayOfWeek) {
        const formattedDate = this.formatDate(currentDate);
        this.dateHeaders.push(formattedDate);
      }
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
  }
  

  formatDate(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }
  
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
 // Add this method to your ViewDataComponent class
 applyFilter() {
  console.log('Filtering by:', this.filterSno);
debugger
  if (this.filterSno) {
    const filterSno = this.filterSno.trim(); // Added trim to handle potential whitespace
    console.log('Filter SNO:', filterSno);
debugger;
this.filteredUser = this.processedData.find(user => user.sno === filterSno);

  } else {
    // Reset the filter
    this.processedData = [...this.originalProcessedData];
  }

  console.log('Updated Processed Data:', this.processedData);
}

filterUser(): void {
  console.log('userInput:', this.userInput);
  console.log('processedData:', this.processedData);

  if (this.userInput) {
    this.filteredData = this.originalData.filter(user => user.sno == this.userInput);

    if (this.filteredData.length === 0) {
      console.log('No user found with the specified S.No');
    }
  } else {
    console.log('Please enter a valid S.No');
  }
  this.originalData = this.processedData;

}



onDateSelectionChange(selectedDate: string): void {
  this.selectedDate = selectedDate;
}

getTotalAmountForSelectedDate(): number {
  let totalAmount = 0;

  if (this.selectedDate && this.originalData.length > 0) {
    this.originalData.forEach(user => {
      const amountForDate = parseFloat(user[this.selectedDate]) || 0;
      totalAmount += amountForDate;
    });
  }

  return totalAmount;
}
openAccountSection() {
  this.isAccountSectionOpen = true;
}

closeAccountSection() {
  this.isAccountSectionOpen = false;
} 
getTotalAmountForAllUsers(): number {
  let totalAmount = 0;
debugger;
  if (this.originalData.length > 0) {
    this.originalData.forEach(user => {
      Object.keys(user).forEach(key => {
        // Check if the key represents a date header (assuming date headers are in 'dd-MM-yyyy' format)
        if (/^\d{2}-\d{2}-\d{4}$/.test(key)) {
          const amountForDate = parseFloat(user[key]) || 0;
          totalAmount += amountForDate;
        }
      });
    });
  }

  return totalAmount;
}
getTotalAmountToPayForAllUsers(): number {
  let totalAmountToPay = 0;

  if (this.originalData.length > 0) {
    this.originalData.forEach(user => {
      totalAmountToPay += user.amountToPay || 0;
    });
  }

  return totalAmountToPay;
}
subtractExpenses(): void {
  // Subtract the entered expenses from the remaining total
  this.remainingTotalAfterExpenses = this.calculateRemainingTotal() - this.expenseAmount;
}
openPopup(): void {
  // Reset password verification when opening popup
  this.isPasswordVerified = false;
  this.isPopupOpen = true;
}

// Method to close the account summary popup
closePopup(): void {
  this.isPopupOpen = false;
}



  saveChanges() {
    const confirmOverwrite = confirm('Do you want to overwrite the existing data?');
  
    if (confirmOverwrite) {
      localStorage.setItem('processedData', JSON.stringify(this.processedData));
    } else {
      const newFileName = prompt('Enter a name for the new file:');
      if (newFileName) {
        localStorage.setItem(newFileName, JSON.stringify(this.processedData));
      }
    }
  
    const dataToWrite = this.processedData.map(row => {
      const newRow = { ...row };
      if (newRow['date'] instanceof Date) {
        // Convert date to Excel serial number and apply date format only to the "date" column
        newRow['date'] = { t: 'n', z: 'mmm d yyyy', v: this.convertDateToSerialNumber(newRow['date']), numFmt: 'mmm d yyyy' };
      }
      return newRow;
    });
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToWrite);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'output.xlsx');
  }
  
  convertDateToSerialNumber(date: Date): number {
    // JavaScript date to Excel serial number conversion
    return (date.getTime() / 86400000) + 25569; // 86400000 = milliseconds in a day, 25569 = days between 1st Jan 1900 and 1st Jan 1970
  }
  
  
  
  
  
  openInstallmentsPopup(user: any): void {
    // Clear the array before pushing new values
 this.isPopupOpen=false;
    this.allAmountsToPay = [];
  
    // Push amountToPay value of each user into the array
    this.originalData.forEach(userData => {
      this.allAmountsToPay.push(userData.amountToPay);
    });
  
    // Open the popup and perform other actions
    this.isPopupOpen = true;
    this.selectedUser = JSON.parse(JSON.stringify(user)); // Deep copy of user data
    this.dateHeaders = [...this.dateHeaders]; // Create a copy of dateHeaders for individuality
    this.calculateTotalAmount();

    this.redUsers = [];
    // Add logic to consider red users
    if (this.isRedUser(user)) {
        this.redUsers.push(user);
    }
  }
  
  openInstallmentsPopups(user: any): void {
    // Perform remaining amount and amount to pay calculations

    const interestRate = user['type'] ? 
      (user['type'].toLowerCase() === 'm' ? 0.4 : 0.2) : 0.2;
    const totalAmountEntered = this.dateHeaders.reduce((total, header) => {
      const amount = parseFloat(user[header]) || 0;
      return total + amount;
    }, 0);
    const remainingAmount = user['amount'] + (user['amount'] * interestRate) - totalAmountEntered;
  
    // Update the remaining amount and amount to pay in the user object
    user.remainingAmount = remainingAmount;
    user.amountToPay = user['amount'] + (user['amount'] * interestRate);
    
    // Update the original data array
    const userIndex = this.originalData.findIndex(userData => userData.name === user.name);
    if (userIndex !== -1) {
      this.originalData[userIndex] = user;
    }
   // Add logic to consider red users
   if (this.isRedUser(user)) {
    this.redUsers.push(user);
}
    // Close the popup immediately after opening
    this.isPopupOpen = false;
    this.redUsers = [];
   
  }
  formatDates(serialNumber: number): string {
    // Convert Excel serial number to JavaScript date
    const date = new Date((serialNumber - 25569) * 86400 * 1000);
  
    // Format the date using Angular's DatePipe
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(date, 'dd-MM-yyyy') ?? '';
  
  }
  closeInstallmentsPopup(): void {
    if (this.selectedUser) {
      const userIndex = this.originalData.findIndex(user => user.name === this.selectedUser.name);
      if (userIndex !== -1) {
        this.originalData[userIndex] = { ...this.selectedUser };
  
        // Update the remaining amount and amount to pay in the user object
        const user = this.originalData[userIndex];
        user.remainingAmount = this.remainingAmount;
        user.amountToPay = this.amountToPay;
      }
    }
    this.selectedUser = null;
    this.isPopupOpen = false; // Reset the flag when closing the popup
    this.calculateTotalAmount();
    this.redUsers = [];

  }
  
  
  onCellEdit(event: any, field: string, rowIndex: number) {
    const sanitizedInput = event.target.innerText.replace(/\s+/g, ' ').trim();
    this.selectedUser[field] = sanitizedInput;
    this.calculateTotalAmount();
    
  }
  calculateTotalAmount() {
    this.totalAmountEntered = 0;
  
    this.dateHeaders.forEach(header => {
      const amount = parseFloat(this.selectedUser[header]) || 0;
      this.totalAmountEntered += amount;
    });
    if (this.totalAmountEntered === 0) {
      this.amountToPay = 0;
    }
   
    this.calculateAmountToPay();  // Calculate amount to pay
    this.calculateRemainingAmount();  // Calculate remaining amount

  }
  
  // Add the remaining amount and amount to pay calculation functions
  calculateRemainingAmount() {
    this.remainingAmount = this.amountToPay - this.totalAmountEntered;
    if (this.remainingAmount === 0) {
      this.selectedUser.isClosed = true;
    } else {
      this.selectedUser.isClosed = false;
    }
  }
  
  calculateAmountToPay() {
    const interestRate = this.selectedUser['type'] ? 
    (this.selectedUser['type'].toLowerCase() === 'm' ? 0.4 : 0.2) : 0.2;    this.amountToPay = this.selectedUser['amount'] + ( this.selectedUser['amount'] * interestRate);
    this.amountToPay = this.selectedUser['amount'] + (this.selectedUser['amount'] * interestRate);

  }
  
  // Method to calculate total amount for all users
// Define the method only once
calculateTotalAmountForAllUsers() {
  this.originalData.forEach(user => {
    let totalAmountEntered = 0;
    this.dateHeaders.forEach(header => {
      const amount = parseFloat(user[header]) || 0;
      totalAmountEntered += amount;
    });
    const interestRate = user['type'] ? 
      (user['type'].toLowerCase() === 'm' ? 0.4 : 0.2) : 0.2;
    const amountToPay = user['amount'] + (user['amount'] * interestRate);
    const remainingAmount = amountToPay - totalAmountEntered;

    // Assign calculated values back to the user object
    user['totalAmountEntered'] = totalAmountEntered;
    user['amountToPay'] = amountToPay;
    user['remainingAmount'] = remainingAmount;

    // Update the isClosed flag based on remaining amount
    user['isClosed'] = remainingAmount === 0;
  });
}

calculateTotalAmounts(): void {
  this.originalData.forEach(user => {
    // Calculate remainingAmount
    const remainingAmount = user.amountToPay - user.totalAmountEntered;
    user.remainingAmount = remainingAmount > 0 ? remainingAmount : 0; // Ensure it's not negative

    // Calculate amountToPay
    const interestRate = user.type ? (user.type.toLowerCase() === 'm' ? 0.4 : 0.2) : 0.2;
    user.amountToPay = user.amount + (user.amount * interestRate);
  });
}

calculateTotalAmountForAllUserss(): number {
  let totalAmount = 0;
  this.processedData.forEach(user => {
    totalAmount += user.amount || 0;
  });
  return totalAmount;
}

calculateRemainingTotal(): number {
  const totalInterestAmount = this.getTotalAmountToPayForAllUsers();
  const totalCollection = this.getTotalAmountForAllUsers();

  return totalInterestAmount - totalCollection;
}


  
  
uploadFromExcel(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  const file: File | null = (inputElement.files && inputElement.files[0]) || null;

  if (file) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const excelData = XLSX.utils.sheet_to_json(sheet);

      this.processedData = excelData.map((excelItem: any, index: number) => {
        // Convert keys to lowercase
        const lowerCasedItem = this.convertKeysToLowerCase(excelItem);

        // Process common fields
        const commonFields = ['sno', 'name', 'mobile', 'address', 'amount', 'date', 'type'];
        const commonData: any = {};
        commonFields.forEach(field => {
          commonData[field] = lowerCasedItem[field];
        });

        // Process additional date columns
        const additionalDatesData: any = {};
        this.dateHeaders.forEach(header => {
          additionalDatesData[header] = lowerCasedItem[header];
        });

        // Combine common and additional data
        return { ...commonData, ...additionalDatesData };
      });

      // Log after processing userinfo
      console.log('After processing userinfo:', this.processedData);

      this.processedData.forEach(user => {
        user.isRed = this.isRedUser(user);
      });

      // Open installments popups for each user
      this.originalData = [...this.processedData];
      this.originalData.forEach(user => {
        this.openInstallmentsPopups(user);
      });

      this.changeDetectorRef.detectChanges();
    };

    reader.readAsBinaryString(file);
  }
}



// Add this method to the component class
convertKeysToLowerCase(obj: any): any {
  const lowerCasedItem: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      lowerCasedItem[key.toLowerCase()] = obj[key];
    }
  }
  return lowerCasedItem;
}



// ... (existing code)

  sanitizeInput(input: string): string {
    // Example: Remove non-numeric characters
    return input.replace(/[^0-9]/g, '');
  }
  
  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.processedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'exported_data.xlsx');
  }

  downloadPDF(): void {
    // Prompt the user for a file name
    const fileName = prompt('Enter file name (without extension):');
    if (!fileName) return; // If the user cancels, exit the function
  
    // Add current date to the file name
    const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
    const fullFileName = `${fileName}_${currentDate}.pdf`;
  
    // Get the account section container element
    const element = document.querySelector('.accountpopup-section-container') as HTMLElement;
  
    // Convert HTML element to canvas using html2canvas
    html2canvas(element).then((canvas) => {
      // Convert canvas to PDF using jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 page width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Download the PDF
      pdf.save(fullFileName);
    });
  }
  downloadinstallmentPDF(userName: string): void {
    const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
  
    // Prompt the user for the day name
    const dayName = prompt('Enter the day name:');
    if (!dayName) return; // If the user cancels, exit the function
  
    // Construct the filename
    const fileName = `${dayName}_${userName}_${currentDate}.pdf`;
  
    // Get the installment popup container element
    const element = document.querySelector('.installments-popup') as HTMLElement;
  
    // Convert HTML element to canvas using html2canvas
    html2canvas(element).then((canvas) => {
      // Convert canvas to PDF using jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 page width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Download the PDF with the constructed filename
      pdf.save(fileName);
    });
  }

  navigateTomain() {
    console.log('Navigating to main page...');

    this.router.navigate(['/navigation']);
  }
  openDataOverviewPopup() {
    this.isDataOverviewPopupOpen = true;
  }

  closeDataOverviewPopup() {
    this.isDataOverviewPopupOpen = false;
  }

  navigateToWeeklyCollection() {

    this.isWeeklyCollectionPopupOpen = true;
    const specificDates = this.calculateSpecificDatesForMonth();

  // Retrieve amounts for specific dates for all users
  this.retrieveAmountsForSpecificDates(specificDates);

    // Add your navigation logic for Weekly Collection page
  }
  closeWeeklyCollectionPopup(): void {
    this.isWeeklyCollectionPopupOpen = false;
  }

  navigateToUsersData() {
    // Add your navigation logic for Users Data page
  }

  navigateToRedUsers() {
    // Add your navigation logic for Red Users page
  }

  // Method to calculate specific dates (Wednesdays or Thursdays) for the selected month
calculateSpecificDatesForMonth(): string[] {
  // Define an array to store specific dates
  const specificDates: string[] = [];
  
  // Convert the selected month to a JavaScript Date object
  const startDate = new Date(this.selectedMonth);
  
  // Loop through all dates of the selected month
  while (startDate.getMonth() === new Date(this.selectedMonth).getMonth()) {
    // Check if the current date is the selected day of the week
    if (this.selectedDayOfWeek === 3 && startDate.getDay() === 3) {
      specificDates.push(this.formatDate(startDate)); // Add the date to the array
    } else if (this.selectedDayOfWeek === 4 && startDate.getDay() === 4) {
      specificDates.push(this.formatDate(startDate)); // Add the date to the array
    }
    
    // Move to the next day
    startDate.setDate(startDate.getDate() + 1);
  }
  
  return specificDates;
}

// Method to retrieve amounts for specific dates for all users
retrieveAmountsForSpecificDates(specificDates: string[]): void {
  // Define an array to store amounts for all users
  const amountsForAllUsers: { date: string; amount: number; }[][] = [];
  
  // Loop through all users
  this.originalData.forEach(user => {
    // Define an array to store amounts for a single user
    const amountsForUser: { date: string; amount: number; }[] = [];
    
    // Loop through specific dates
    specificDates.forEach(date => {
      // Retrieve the amount for the current date and user
      const amount = parseFloat(user[date]) || 0;
      
      // Add the date and amount to the array
      amountsForUser.push({ date, amount });
    });
    
    // Add amounts for the current user to the array
    amountsForAllUsers.push(amountsForUser);
  });
  
  // Pass the amounts to the graph component to display
  // You can use this data to generate the graph
  this.amountsForAllUsers = amountsForAllUsers;
}


// Method to format date (already implemented in your code)




onDayOfWeekSelectionChange(selectedDayOfWeek: number): void {
  this.selectedDayOfWeek = selectedDayOfWeek;
}
showWeeklyCollection(): void {
  if (this.selectedMonth && this.selectedDayOfWeek) {
    // Calculate specific dates based on selected month and day of the week
    const specificDates = this.calculateSpecificDatesForMonth();

    // Retrieve amounts for specific dates for all users
    this.retrieveAmountsForSpecificDates(specificDates);

    // Close the popup after displaying details
    this.isWeeklyCollectionPopupOpen = false;
  } else {
    // Inform the user to select both month and day of the week
    alert('Please select both month and day of the week.');
  }
}
filterDatesByMonth(): void {
  // Clear selected date when a new month is selected
  this.selectedDateFilter = '';

  // Filter date headers based on the selected month
  if (this.selectedMonthFilter) {
    const monthIndex = this.months.findIndex(month => month === this.selectedMonthFilter);
    if (monthIndex !== -1) {
      const filteredDates = this.dateHeaders.filter(date => {
        const [day, month] = date.split('-'); // Split date into day and month parts
        return parseInt(month) === monthIndex + 1; // Check if month matches selected month's index
      });
      this.filteredDates = filteredDates;
    }
  } else {
    this.filteredDates = []; // Clear filtered dates if no month is selected
  }
}
onMonthSelectionChange(selectedMonth: string): void {
  // Update selected month and retrieve amounts for all dates of the selected month
  this.selectedMonth = selectedMonth;
  this.retrieveAmountsForSelectedMonth();
  const totalCollection = this.getTotalCollectionForMonth(selectedMonth);

}

// Method to retrieve amounts for all dates of the selected month
retrieveAmountsForSelectedMonth(): void {
  // Clear selected date when month changes
  this.selectedDate = '';

  if (this.selectedMonth) {
    const monthIndex = this.months.findIndex(month => month === this.selectedMonth);
    if (monthIndex !== -1) {
      const selectedMonthDates: string[] = this.dateHeaders.filter(date => {
        const [day, month] = date.split('-');
        return parseInt(month) === monthIndex + 1;
      });

      // Retrieve amounts for all users for each date of the selected month
      this.selectedMonthData = selectedMonthDates.map(date => {
        let totalAmount = 0;
        this.originalData.forEach(user => {
          const amountForDate = parseFloat(user[date]) || 0;
          totalAmount += amountForDate;
        });
        return { date, amount: totalAmount };
      });
    }
  } else {
    this.selectedMonthData = []; // Clear selected month data if no month is selected
  }
}


getTotalCollectionForMonth(month: string): number {
  let totalCollection = 0;
  if (this.selectedMonthData.length > 0) {
    this.selectedMonthData.forEach(data => {
      totalCollection += data.amount;
    });
  }

  return totalCollection;
}

// Method to filter and display red users
showRedUsers(): void {
  console.log('showRedUsers() method called');
  // Filter data to find red users
  this.isDataOverviewPopupOpen = false;

  const filteredData = this.originalData.filter(user => {
    const isRed = this.isRedUser(user); // Check if the user is red
    console.log(`${user.name} is red user: ${isRed}`);
    return isRed; // Return true if the user is red
  });

  // Display red users or perform any necessary actions
  console.log('Filtered red users:', filteredData);
  const redUsers = this.originalData.filter(user => {
    return this.isRedUser(user); // Check if the user is red
  });
  console.log('Red Users:');
  redUsers.forEach((user, index) => {
    console.log(`${index + 1}. S.No: ${user.sno}, Name: ${user.name}, Mobile: ${user.mobile}`);
  });
  this.isRedUsersPopupOpen = true; // Show the popup containing red users
}
 // Method to determine if a string represents a valid date
 isDate(dateString: string): boolean {
  return dateString.match(/^\d{2}-\d{2}-\d{4}$/) !== null;
}

// Method to determine if a user is red based on missed payments for three consecutive weeks
isRedUser(user: any): boolean {
  debugger;
  if (!user) {
    console.log('User object is null or undefined.');
    return false;
  }

  const febDateHeaders = Object.keys(user).filter(prop => {
    if (!this.isDate(prop)) {
      return false; // Skip non-date headers
    }
    const [day, month, year] = prop.split('-').map(Number);
    return month === 2; // Filter date headers for February
  });

  console.log('Filtered February date headers:', febDateHeaders);

  const consecutiveUndefinedDates = [1,8, 15, 22, 29]; // Dates to check for consecutive undefined amounts
  let consecutiveUndefinedCount = 0;

  for (const date of febDateHeaders) {
    const dayOfMonth = parseInt(date.split('-')[0]);
    if (consecutiveUndefinedDates.includes(dayOfMonth)) {
      if (typeof user[date] === 'undefined') {
        consecutiveUndefinedCount++;
        console.log(`Amount is undefined for date ${date}.`);
        if (consecutiveUndefinedCount === 4) {
          console.log('Three consecutive undefined amounts found in February.');
          this.redUsers.push(user);

          return true; // Return true if three consecutive dates have undefined amounts
        }
      } else {
        console.log(`Amount is defined for date ${date}.`);
        consecutiveUndefinedCount = 0; // Reset the count if a defined amount is encountered
      }
    }
  }

  console.log('No three consecutive undefined amounts found in February.');
  return false; // Return false if no three consecutive dates have undefined amounts
}




// Helper function to check if a date string represents a January date





closeRedUsersPopup(){
  this.isRedUsersPopupOpen=false;
}
}