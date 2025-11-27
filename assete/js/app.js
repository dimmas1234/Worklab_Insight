document.addEventListener("DOMContentLoaded", () => {
    // === 1. Variable & Selectors ===
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const desktopMenu = document.getElementById('desktopMenu');
    const searchInput = document.getElementById('searchInput');
    const sectorFilter = document.getElementById('sectorFilter');
    const locationFilter = document.getElementById('locationFilter');
    const searchButton = document.getElementById('searchButton');
    const viewAllJobsBtn = document.getElementById('viewAllJobs');
    const jobListingsContainer = document.getElementById('jobListings');

    // Variabel untuk data
    let allJobsData = [];      // Menyimpan semua 50 data
    let currentFilteredJobs = []; // Menyimpan hasil filter saat ini
    let jobsToShow = 9;        // Jumlah awal yang ditampilkan
    const jobsIncrement = 9;   // Jumlah tambahan saat klik 'Lihat Semua'

    // === 2. Event Listeners UI (Menu, dll) ===
    if (mobileMenuBtn && desktopMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            desktopMenu.classList.toggle('hidden');
        });
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('nav-active'));
            this.classList.add('nav-active');
        });
    });

    // === 3. Fungsi Utama (Fetch & Render) ===

    // Fungsi Fetch Data JSON
    async function fetchJobs() {
        try {
            // Menampilkan loading state
            jobListingsContainer.innerHTML = '<div class="col-span-full text-center py-8">Memuat data lowongan...</div>';
            
            // Fetch ke file JSON (Pastikan path sesuai struktur folder)
            const response = await fetch('assete/data/jobs.json'); 
            
            if (!response.ok) throw new Error('Gagal mengambil data');
            
            allJobsData = await response.json();
            currentFilteredJobs = allJobsData; // Awalnya filter berisi semua data
            
            // Render data awal
            renderJobCards();
        } catch (error) {
            console.error('Error:', error);
            jobListingsContainer.innerHTML = `
                <div class="col-span-full text-center py-8 text-red-500">
                    Gagal memuat data. Pastikan menjalankan via Localhost/Server.
                </div>`;
        }
    }

    // Fungsi Render Card
    function renderJobCards() {
        jobListingsContainer.innerHTML = '';

        if (currentFilteredJobs.length === 0) {
            jobListingsContainer.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-500">
                    Tidak ada lowongan yang sesuai dengan pencarian Anda.
                </div>
            `;
            viewAllJobsBtn.style.display = 'none'; // Sembunyikan tombol jika kosong
            return;
        }

        // Ambil data sesuai limit (Pagination sederhana)
        // Jika jobsToShow lebih besar dari total data, ambil semua
        const dataToRender = currentFilteredJobs.slice(0, jobsToShow);

        dataToRender.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card'; // Pastikan CSS job-card sudah ada
            
            // Badge logic
            let typeClass = '';
            if (job.type === 'Full-time') typeClass = 'full-time';
            else if (job.type === 'Magang') typeClass = 'magang';
            else if (job.type === 'Part-time') typeClass = 'part-time';
            else typeClass = 'contract'; // Default style jika ada tipe lain

            jobCard.innerHTML = `
                <div class="job-type-badge ${typeClass}">${job.type}</div>
                <div class="job-header">
                    <div class="company-logo">${job.logo}</div>
                    <div>
                        <div class="job-title">${job.title}</div>
                        <div class="company-name">${job.company}</div>
                    </div>
                </div>
                <div class="job-meta">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${job.location}</span>
                </div>
                <div class="job-meta">
                    <i class="far fa-clock"></i>
                    <span>Posted ${job.posted}</span>
                </div>
                <div class="job-tags">
                    ${job.skills.map(skill => `<span class="job-tag">${skill}</span>`).join('')}
                </div>
                <div class="job-salary">${job.salary}</div>
                <div class="job-buttons">
                    <button class="detail-button" onclick="showJobDetail(${job.id})">
                        <i class="fas fa-eye mr-2"></i>Lihat Detail
                    </button>
                    <a href="#" class="apply-button">
                        <i class="fas fa-paper-plane mr-2"></i>Lamar
                    </a>
                </div>
            `;
            jobListingsContainer.appendChild(jobCard);
        });

        // Logika Tombol "Lihat Semua" / "Load More"
        // Jika data yang tampil < total data hasil filter, tampilkan tombol
        if (dataToRender.length < currentFilteredJobs.length) {
            viewAllJobsBtn.style.display = 'inline-block';
            viewAllJobsBtn.textContent = 'Muat Lebih Banyak Lowongan ↓';
        } else {
            viewAllJobsBtn.style.display = 'none'; // Sembunyikan jika sudah tampil semua
        }
    }

    // === 4. Search & Filter Logic ===
    function filterJobs() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedSector = sectorFilter.value;
        const selectedLocation = locationFilter.value;

        // Reset limit tampilan ke awal setiap kali filter berubah
        jobsToShow = 9;

        currentFilteredJobs = allJobsData.filter(job => {
            const matchesSearch = !searchTerm || 
                job.title.toLowerCase().includes(searchTerm) || 
                job.company.toLowerCase().includes(searchTerm) ||
                job.description.toLowerCase().includes(searchTerm);
            
            // Logika Filter Sektor (Proxy by Company Name untuk contoh)
            // Di real app, sebaiknya ada properti "sector" di JSON
            const matchesSector = !selectedSector || 
                (selectedSector === 'Teknologi Informasi' && (job.skills.includes('React') || job.skills.includes('Python') || job.title.includes('Developer'))) ||
                (selectedSector === 'Manufaktur' && job.company.toLowerCase().includes('manufaktur')) ||
                (selectedSector === 'Jasa Keuangan' && (job.company.toLowerCase().includes('bank') || job.company.toLowerCase().includes('finansial'))) ||
                (selectedSector === 'Pendidikan' && (job.title.includes('Guru') || job.company.includes('Course'))) ||
                (selectedSector === 'Kesehatan' && (job.company.includes('RS') || job.company.includes('Klinik')));
            
            const matchesLocation = !selectedLocation || job.location === selectedLocation;
            
            return matchesSearch && matchesSector && matchesLocation;
        });

        renderJobCards();
    }

    // Event Listeners Filter
    searchInput.addEventListener('keyup', filterJobs);
    sectorFilter.addEventListener('change', filterJobs);
    locationFilter.addEventListener('change', filterJobs);
    searchButton.addEventListener('click', filterJobs);

    // Event Listener Tombol "View All" (Sekarang jadi Load More)
    viewAllJobsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Tambahkan limit tampilan
        jobsToShow += jobsIncrement;
        renderJobCards();
    });

    // === 5. Modal Logic (Global Functions) ===
    window.showJobDetail = function(jobId) {
        const job = allJobsData.find(j => j.id === jobId);
        if (!job) return;

        document.getElementById('modalJobTitle').textContent = job.title;
        document.getElementById('modalCompanyName').textContent = job.company;
        document.getElementById('modalLocation').querySelector('span').textContent = job.location;
        document.getElementById('modalCompanyLogo').textContent = job.logo;
        document.getElementById('modalDescription').textContent = job.description;
        document.getElementById('modalDetails').textContent = job.details;
        
        const jobTypeBadge = document.getElementById('modalJobType');
        jobTypeBadge.textContent = job.type;
        // Reset class
        jobTypeBadge.className = 'inline-block px-3 py-1 rounded-full text-sm font-medium';
        
        if (job.type === 'Full-time') jobTypeBadge.classList.add('bg-blue-100', 'text-blue-800');
        else if (job.type === 'Magang') jobTypeBadge.classList.add('bg-green-100', 'text-green-800');
        else jobTypeBadge.classList.add('bg-yellow-100', 'text-yellow-800');

        const requirementsList = document.getElementById('modalRequirements');
        requirementsList.innerHTML = '';
        if(job.requirements) {
            job.requirements.forEach(req => {
                const li = document.createElement('li');
                li.textContent = req;
                requirementsList.appendChild(li);
            });
        }

        document.getElementById('jobDetailModal').classList.remove('hidden');
    };

    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('jobDetailModal').classList.add('hidden');
    });

    document.getElementById('jobDetailModal').addEventListener('click', (e) => {
        if (e.target.id === 'jobDetailModal') {
            document.getElementById('jobDetailModal').classList.add('hidden');
        }
    });

    // === 6. Initialize ===
    fetchJobs(); // Panggil fungsi fetch saat halaman dimuat
});