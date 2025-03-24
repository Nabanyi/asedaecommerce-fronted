import { Button } from "react-bootstrap"
import Swal from "sweetalert2";

interface CartData{
    id:string;
    name:string;
    image:string;
    price:number;
    quantity:number;
    total:number;
}

interface CartButtonProps {
    showFullButton?: boolean;
    ad: CartData;
}

export const CartButton: React.FC<CartButtonProps> = ({ showFullButton = false, ad }) => {
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });
      
    const saveCart = async (ad: CartData): Promise<void> => {
        try {
            const cartSaved = localStorage.getItem('ads');
      
            let cartItems: CartData[];
            if (cartSaved !== null) {
                cartItems = JSON.parse(cartSaved) as CartData[];
                if (!Array.isArray(cartItems)) {
                    cartItems = [];
                }
            } else {
                cartItems = [];
            }

            let found = false;
            if(cartItems.length > 0){
                for (let i = 0; i < cartItems.length; i++) {
                    const row = cartItems[i];
                    if(row.id == ad.id){
                        cartItems[i].quantity = (cartItems[i].quantity || 1) + 1;
                        cartItems[i].total = (cartItems[i].total || cartItems[i].price) + cartItems[i].price;
                        found = true;
                        break;
                    }
                    
                }
            }

            if (!found) {
                cartItems.push(ad);
            }
            
            localStorage.setItem('ads', JSON.stringify(cartItems));

            Toast.fire({ icon: "success", text: "Item added to cart successfully" });
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            throw error;
        }
    };



    return (
        <>
        {showFullButton ? 
            (
                <Button onClick={() => {saveCart(ad)}} variant="primary" className='text-end' title="Add to Cart"><i className='bx bxs-cart-add bx-sm'></i> Add to Cart</Button>
            ) : (
                <Button onClick={() => {saveCart(ad)}} variant="link" className='text-end' title="Add to Cart"><i className='bx bxs-cart-add bx-sm'></i></Button>
            )
        }
        </>
    )
}