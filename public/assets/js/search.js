
document.addEventListener('DOMContentLoaded',function() {


    function updateSearch(targetGroup,selectedBrands){

        const brands = Object.keys(selectedBrands);
        const brandQuerypara = brands.join(',');
   
        fetch(`http://localhost:2000/showcase?group=${targetGroup}&brands=${encodeURIComponent(brandQuerypara)}`,{
            headers:{  'Accept': 'application/json' }
        })
        .then(response => {
            if(!response.ok){
    
                throw new Error("Network response was not ok for while performing advanced search")
            }
            return response.json();
        })
        .then(data => {
    
            console.log('data recieved : ',data)
                             
        })
        .catch(error => {
            console.log("There was a problem while performing Advanced search",error)
        });

    }


    const selectedBrands = {};
    let targetGroup = '';
    const brandCheckBox = document.querySelectorAll('.showcase-brand');
    brandCheckBox.forEach(checkbox => {

        checkbox.addEventListener('change',function() {

            const brand = this.getAttribute('data-brand');
            const isChecked = this.checked;
            targetGroup = this.getAttribute('data-group');                

            if(isChecked){
                selectedBrands[brand] = true;
            }else{
                delete selectedBrands[brand];
            }

            updateSearch(targetGroup,selectedBrands);
        })
   })

})