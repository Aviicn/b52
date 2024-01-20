let dataBlog = [];
let dataIcons = [];
console.log('test', dataBlog);

function submitProject(event) {
    event.preventDefault()

    let inputProject = document.getElementById('inputProject').value;
    let startDate = new Date(document.getElementById('startDate').value);
    let endDate = new Date(document.getElementById('endDate').value);
    let desc = document.getElementById('desc').value;

    // icon checkbox
    const nodejs = `./assets/img/nodejs.png`;
    const reactjs = `./assets/img/react.png" `;
    const nextjs = `./assets/img/nextjs.png`;
    const typescirpt = `./assets/img/typescirpt.png`;

    // deklarasi variabel icons
    let icon1 = document.getElementById('nodeJs');
    let icon2 = document.getElementById('reactJs');
    let icon3 = document.getElementById('nextJs');
    let icon4 = document.getElementById('typeScript');

    // Check Icon
    const iconsForCurrentCard = [];
    icon1.checked === true && iconsForCurrentCard.push(nodejs);
    icon2.checked === true && iconsForCurrentCard.push(reactjs);
    icon3.checked === true && iconsForCurrentCard.push(nextjs);
    icon4.checked === true && iconsForCurrentCard.push(typescirpt);

    console.log('data', iconsForCurrentCard);

    // Memeriksa apakah nilai input kosong
    if(!inputProject || !startDate || !endDate || !desc) {
        alert('Mohon diisi!');
        return;
    }

    // Hitung selisih dalam hari
    const days = dayDifference(startDate, endDate);

    // Menentukan unit durasi berdasarkan selisih waktu
    const {duration, unit} = chooseDuration(days);

    let inputImage = document.getElementById('inputImage').files;

    console.log(`${inputProject} ${startDate} ${endDate} ${inputImage}`);

    inputImage = URL.createObjectURL(inputImage[0]);
    console.log(`${inputImage}`);

    const blog = {
        project: inputProject,
        startDate: startDate,
        endDate: endDate,
        desc: desc,
        image: inputImage,
        duration: duration,
        unit: unit
    };

    dataBlog.push(blog);
    dataIcons.push(iconsForCurrentCard); // simpan icons untuk iconsForCurrentCard
    console.log(dataBlog);
    console.log(dataIcons);
    renderBlog();
}

function renderBlog() {
    document.getElementById('contents').innerHTML = '';

    for (let i = 0; i < dataBlog.length; i++) {
        console.log('data gambar', dataBlog[i]);

        // Menggunakan map untuk membuat array elemen HTML untuk icon current card
        const iconsHTML = dataIcons[i].map(icon => `<img src=".${icon}">`).join('');

        document.getElementById('contents').innerHTML += `<div class="card mb-5 rounded-4">
        <img src="${dataBlog[i].image}" class="card-img-top rounded-3">
        <div class="card-body">
          <a href="detail.html" class="text-decoration-none"><h3 class="card-title text-primary-emphasis fw-bold fs-4">${dataBlog[i].project}</h3></a>
          <h6 class="fs-6">${dataBlog[i].duration} ${dataBlog[i].unit}</h6>
          <p class="card-text fs-5 mt-5">${dataBlog[i].desc}</p>
          <div class="mb-5 mt-4">
            <div class="d-flex gap-3" id="icon">${iconsHTML}</div>
          </div>
          <div class="d-flex gap-3">
          <a href="#" class="btn btn-primary btn-card">edit</a>
          <a href="#" class="btn btn-primary btn-card">delete</a>
          </div>
        </div>
      </div>`;
    }
}

function dayDifference (start, end) {
    const timeDiff = end.getTime() - start.getTime();
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

function chooseDuration(days) {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;

    if(years > 0) {
        return { duration: years, unit: 'tahun' };
    } else if (months > 0) {
        return { duration: months, unit: 'bulan' };
    } else  {
        return { duration: remainingDays, unit: 'hari' };
    }
}