
    function addToCart(proId){
        $.ajax({
            url:'/addtocart/'+proId,
            method:'get',
            success:(response)=>{
                if(response.status){
                    let count=$('#cart-count').html()
                    count=parseInt(count)+1
                    $("cart-count").html(count)
                    Swal.fire("Added to cart");

                }
                
            }
        })
    }
    function coupenApply() {
        var value = document.getElementById('coupon-enter').value;
        console.log("ahah", value);
        $.ajax({
          url: '/checkCoupen',
          method: 'post',
          dataType: 'json',
          data: { 'value': value },
          success: function (response) {
            if (response.msg == 'success') {
              console.log("coupen verified")
              alert('coupen verified Successfully')
              console.log("data", response.data)
              discount_value = response.data.discount
              console.log(discount_value);
              total_prize = document.getElementById('total-prize')
              disc = document.getElementById('disc')
              tp = total_prize.textContent;
              console.log(tp, "total prize", total_prize);
             
              tp = tp - discount_value
              console.log("finally", tp);
              total_prize.textContent = tp;
              disc.textContent = discount_value
              $("div.input_promotion").hide()
               $("div.couponapplied").show()
            //   applied.textContent = response.data[0].Discountprice
            } else if (response.msg == 'coupenExist') {
              alert('Coupen already used')
            } else if (response.msg == 'coupennotfound') {
              alert("coupen code is incorrect")
            } else if (response.msg == 'coupenapplied') {
              alert("Coupen already applied")
            }
            else {
              console.log("coupen id is fake")
            }
          },
        });
      
      }