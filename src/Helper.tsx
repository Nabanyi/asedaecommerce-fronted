import Swal from "sweetalert2";
import { UserContext } from "./UserContext";
import { useContext } from "react";

export const getUserSessionData = () => {
  const { user } = useContext(UserContext);
  return {
    id: user?.id,
    username: user?.username,
    role: user?.role,
    firstName: user?.firstName,
    lastName: user?.lastName,
    middleName: user?.middleName,
    email: user?.email,
    phone: user?.phone,
    address: user?.address
  }       
}

export const showInternetErrorAlert = () => {
  return Swal.fire({
    icon: "error",
    title: "Error",
    text: "Please check your internet connection and try again",
    confirmButtonText: "Okay!",
    showConfirmButton: true,
    customClass: {
        confirmButton: 'btn btn-primary'
    }
  });
}
  
export const showCustomErrorAlert = (msg: string) => {
  return Swal.fire({
    icon: "error",
    title: "Error",
    text: msg,
    confirmButtonText: "Okay!",
    showConfirmButton: true,
    customClass: {
        confirmButton: 'btn btn-primary'
    }
  });
}
  
export const showCustomSuccessAlert = (msg: string) => {
  return Swal.fire({
    icon: "success",
    title: "Success",
    text: msg,
    confirmButtonText: "Okay!",
    showConfirmButton: true,
    customClass: {
        confirmButton: 'btn btn-primary'
    }
  });
}

export const timeAgo = (dateTimeString: string) => {
  const inputDate = new Date(dateTimeString);
  const now = new Date();

  const seconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

  if (seconds < 60) {
    return seconds <= 1 ? "a second ago" : `${seconds} seconds ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes <= 1 ? "a minute ago" : `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours <= 1 ? "an hour ago" : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return days <= 1 ? "a day ago" : `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months <= 1 ? "a month ago" : `${months} months ago`;
  }

  const years = Math.floor(months / 12);
  return years <= 1 ? "a year ago" : `${years} years ago`;
}

export const formatNumber = (num: number, n: number, x?: number): string => {
  const re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return num.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};