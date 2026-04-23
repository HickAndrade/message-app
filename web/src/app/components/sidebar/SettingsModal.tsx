"use client";

import type { User } from "@/app/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import Modal from "../Modal";
import Input from "../inputs/Input";
import Image from "next/image";
import { CldUploadButton } from "next-cloudinary";
import Button from "../Button";
import { browserApi } from "@/app/services/api/browser";

interface SettingsModalProps {
    currentUser: User;
    isOpen?:boolean;
    onClose: () => void;
}

const SettingsModal = ({ 
    currentUser,
    onClose,
    isOpen
 }:SettingsModalProps) => {
    const router = useRouter();
    const[isLoading, setIsLoading] = useState(false);

    const { 
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<FieldValues>({
        defaultValues:{
            name: currentUser?.name,
            image: currentUser?.image ?? undefined
        }
    })

    const image = watch('image');
    const uploadButtonClassName = clsx(`
        flex
        justify-center
        rounded-md
        px-3
        py-2
        text-sm
        font-semibold
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-2-offset-2
        text-gray-900
    `, isLoading && "opacity-50 cursor-default");
    
    const handleUpload = (result: any) => {
        setValue('image', result?.info?.secure_url, {
            shouldValidate: true
        })
    }

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);
        const payload = {
            ...(typeof data.name === "string" ? { name: data.name } : {}),
            ...(typeof data.image === "string" ? { image: data.image } : {})
        };

        browserApi.post(`/users/settings`, payload)
        .then(() => {
            router.refresh();
            onClose();
        })
        .catch(() => toast.error('Something went wrong!'))
        .finally(() => setIsLoading(false));
    }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="
                    text-base 
                    font-semibold 
                    leading-7
                    text-gray-900">
                    Perfil
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                        Edite sua Informação Publica
                    </p>
                    <div className="mt-10 flex flex-col gap-y-8">
                        <Input 
                            disabled={isLoading}
                            label="Name"
                            id="name"
                            register={register}
                            required
                            errors={errors}
                        />
                        <div>
                            <label htmlFor="foto" className="
                            block
                            text-sm
                            font-medium
                            leading-6
                            text-gray-900
                            ">
                                Foto
                            </label>
                            <div className="
                            mt-2
                            flex
                            items-center
                            gap-x-3
                            ">
                                <Image 
                                width="48" 
                                height="48" 
                                className="rounded-full" 
                                src={image ||currentUser?.image || '/images/placeholder.jpg' } 
                                alt="Avatar"
                                />
                                {isLoading ? (
                                    <span className={uploadButtonClassName}>
                                        Mudar foto
                                    </span>
                                ) : (
                                    <CldUploadButton 
                                    options={{ maxFiles: 1 }}
                                    onUpload={handleUpload}
                                    uploadPreset="nwtj5uuk"
                                    className={uploadButtonClassName}>
                                        Mudar foto
                                    </CldUploadButton>
                                )}
                            </div>
                        </div>
                    </div>
                </div> 
            <div className="
            mt-6
            flex
            items-center
            justify-end
            gap-x-6
            ">
                <Button disabled={isLoading} secondary type="button" onClick={onClose}>
                    Cancelar
                </Button>
                <Button disabled={isLoading} secondary type="submit">
                    Salvar
                </Button>
            </div>

            </div>
        </form>
    </Modal>
  )
}


export default SettingsModal;
