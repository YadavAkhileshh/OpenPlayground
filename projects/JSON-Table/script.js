        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const jsonInput = document.getElementById('jsonInput');
            const searchInput = document.getElementById('searchInput');
            const renderBtn = document.getElementById('renderBtn');
            const clearBtn = document.getElementById('clearBtn');
            const exportCsvBtn = document.getElementById('exportCsvBtn');
            const copyCsvBtn = document.getElementById('copyCsvBtn');
            const loadExample = document.getElementById('loadExample');
            const tableHeader = document.getElementById('tableHeader');
            const tableBody = document.getElementById('tableBody');
            const rowCount = document.getElementById('rowCount');
            const colCount = document.getElementById('colCount');
            const notification = document.getElementById('notification');
            
            // Sample JSON data
            const sampleJson = [
                {
                    "id": 1,
                    "name": "John Smith",
                    "age": 30,
                    "email": "john.smith@example.com",
                    "city": "New York",
                    "occupation": "Software Engineer",
                    "salary": 85000
                },
                {
                    "id": 2,
                    "name": "Jane Doe",
                    "age": 25,
                    "email": "jane.doe@example.com",
                    "city": "Los Angeles",
                    "occupation": "Graphic Designer",
                    "salary": 65000
                },
                {
                    "id": 3,
                    "name": "Robert Johnson",
                    "age": 35,
                    "email": "robert.j@example.com",
                    "city": "Chicago",
                    "occupation": "Product Manager",
                    "salary": 95000
                },
                {
                    "id": 4,
                    "name": "Emily Wilson",
                    "age": 28,
                    "email": "emily.w@example.com",
                    "city": "Miami",
                    "occupation": "Data Analyst",
                    "salary": 72000
                },
                {
                    "id": 5,
                    "name": "Michael Brown",
                    "age": 32,
                    "email": "michael.b@example.com",
                    "city": "Seattle",
                    "occupation": "Marketing Specialist",
                    "salary": 68000
                }
            ];
            
            // Variables
            let jsonData = [];
            let filteredData = [];
            let tableHeaders = [];
            
            // Load example JSON
            loadExample.addEventListener('click', function() {
                jsonInput.value = JSON.stringify(sampleJson, null, 2);
                showNotification('Example JSON loaded successfully!');
            });
            
            // Render table from JSON
            renderBtn.addEventListener('click', function() {
                try {
                    // Parse JSON input
                    const inputText = jsonInput.value.trim();
                    if (!inputText) {
                        showNotification('Please enter JSON data', 'error');
                        return;
                    }
                    
                    jsonData = JSON.parse(inputText);
                    
                    // Check if it's an array
                    if (!Array.isArray(jsonData)) {
                        // If it's an object, convert to array with single element
                        if (typeof jsonData === 'object') {
                            jsonData = [jsonData];
                        } else {
                            showNotification('JSON must be an array or object', 'error');
                            return;
                        }
                    }
                    
                    // Check if array is empty
                    if (jsonData.length === 0) {
                        showNotification('JSON array is empty', 'error');
                        return;
                    }
                    
                    // Extract headers from first object
                    tableHeaders = Object.keys(jsonData[0]);
                    
                    // Render table
                    renderTable(jsonData);
                    showNotification(`Table rendered successfully with ${jsonData.length} rows`);
                    
                } catch (error) {
                    showNotification(`Error parsing JSON: ${error.message}`, 'error');
                }
            });
            
            // Clear input and table
            clearBtn.addEventListener('click', function() {
                jsonInput.value = '';
                tableHeader.innerHTML = '';
                tableBody.innerHTML = '';
                rowCount.textContent = '0 rows displayed';
                colCount.textContent = '0 columns';
                searchInput.value = '';
                showNotification('Cleared all data');
            });
            
            // Export as CSV
            exportCsvBtn.addEventListener('click', function() {
                if (jsonData.length === 0) {
                    showNotification('No data to export', 'error');
                    return;
                }
                
                const csvContent = convertToCSV(jsonData);
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                
                link.setAttribute('href', url);
                link.setAttribute('download', 'data_export.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showNotification('CSV file downloaded successfully');
            });
            
            // Copy CSV to clipboard
            copyCsvBtn.addEventListener('click', function() {
                if (jsonData.length === 0) {
                    showNotification('No data to copy', 'error');
                    return;
                }
                
                const csvContent = convertToCSV(jsonData);
                navigator.clipboard.writeText(csvContent)
                    .then(() => showNotification('CSV copied to clipboard'))
                    .catch(err => showNotification('Failed to copy CSV', 'error'));
            });
            
            // Search functionality
            searchInput.addEventListener('input', function() {
                const searchTerm = searchInput.value.toLowerCase();
                
                if (!searchTerm) {
                    filteredData = [...jsonData];
                    renderTable(filteredData);
                    return;
                }
                
                filteredData = jsonData.filter(row => {
                    return Object.values(row).some(value => 
                        String(value).toLowerCase().includes(searchTerm)
                    );
                });
                
                renderTable(filteredData);
            });
            
            // Helper function to render table
            function renderTable(data) {
                // Clear existing table
                tableHeader.innerHTML = '';
                tableBody.innerHTML = '';
                
                // Set filtered data
                filteredData = [...data];
                
                // Create table headers
                tableHeaders.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    tableHeader.appendChild(th);
                });
                
                // Create table rows
                filteredData.forEach(row => {
                    const tr = document.createElement('tr');
                    
                    tableHeaders.forEach(header => {
                        const td = document.createElement('td');
                        td.textContent = row[header] !== undefined ? row[header] : '';
                        tr.appendChild(td);
                    });
                    
                    tableBody.appendChild(tr);
                });
                
                // Update stats
                rowCount.textContent = `${filteredData.length} row${filteredData.length !== 1 ? 's' : ''} displayed`;
                colCount.textContent = `${tableHeaders.length} column${tableHeaders.length !== 1 ? 's' : ''}`;
            }
            
            // Helper function to convert JSON to CSV
            function convertToCSV(data) {
                if (data.length === 0) return '';
                
                // Get headers from first object
                const headers = Object.keys(data[0]);
                
                // Create CSV rows
                const csvRows = [
                    headers.join(','), // Header row
                    ...data.map(row => 
                        headers.map(header => {
                            const value = row[header] !== undefined ? String(row[header]) : '';
                            // Escape quotes and wrap in quotes if contains comma or quote
                            const escaped = value.replace(/"/g, '""');
                            return value.includes(',') || value.includes('"') || value.includes('\n') 
                                ? `"${escaped}"` 
                                : escaped;
                        }).join(',')
                    )
                ];
                
                return csvRows.join('\n');
            }
            
            // Helper function to show notifications
            function showNotification(message, type = 'success') {
                notification.textContent = message;
                notification.className = 'notification';
                
                // Set color based on type
                if (type === 'error') {
                    notification.style.backgroundColor = '#e74c3c';
                } else if (type === 'success') {
                    notification.style.backgroundColor = '#28a745';
                }
                
                // Show notification
                notification.classList.add('show');
                
                // Hide after 3 seconds
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
            
            // Auto-render if JSON is already in the textarea
            if (jsonInput.value.trim()) {
                renderBtn.click();
            }
        });