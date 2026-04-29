'use client';

import { useState, useCallback } from "react";
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';
import { BsGithub, BsGoogle } from 'react-icons/bs';


import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/Input";
import { AuthSocialButton } from "./AuthSocialButton";
import { toast } from 'react-hot-toast';

import { useRouter } from 'next/navigation';
import { useAuth } from "@/app/context/AuthContext";
import { browserApi } from "@/app/services/api/browser";

type Variant = 'LOGIN'|'REGISTER'; /*Union Type */

export default function AuthForm() {
    const router = useRouter();
    const { setCurrentUser } = useAuth();

    const [variant, setVariant] = useState<Variant>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);


    const toggleVariant = useCallback(() => {
        if(variant === 'LOGIN') {
            setVariant('REGISTER');
        }else {
            setVariant('LOGIN');
        }
    }, [variant])

    const {register, handleSubmit, formState: { errors }} = useForm<FieldValues>({ 
        defaultValues: { name: '', email: '', password: ''}
    });

   
    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);
    
        if(variant ==='REGISTER'){
            
            browserApi.post('/auth/register', data)
            .then(({ data: user }) => {
                setCurrentUser(user);
                toast.success('Conta criada!');
                router.push('/users');
                router.refresh();
            })
            .catch(({ response }) => toast.error(response?.data?.message ?? 'Não foi possível criar a conta.'))
            .finally(() => setIsLoading(false))
            
            
        }
        if(variant === 'LOGIN'){
           browserApi.post('/auth/login', data)
           .then(({ data: user }) => {
                setCurrentUser(user);
                toast.success('Login realizado!');
                router.push('/users');
                router.refresh();
           })
           .catch(({ response }) => {
                toast.error(response?.data?.message ?? 'Credenciais inválidas.');
           })
           .finally(() => setIsLoading(false))
        }
    }

    const socialAction = (_action: string) => {
        toast('Login social ficará para a próxima etapa.');
    }

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="
         bg-white
        px-4
        py-8
        shadow
        sm:rounded-lg
        sm:px-10
        ">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {variant === 'REGISTER' && (
                <Input id="name" label="Nome" register={register} errors={errors} disabled={isLoading} /> 
            )}
             <Input id="email" label="E-mail" type="email" register={register} errors={errors} disabled={isLoading} />
             <Input id="password" label="Senha" type="password" register={register} errors={errors} disabled={isLoading}/>
            
            <div>
                <Button disabled={isLoading} fullWidth type="submit">
                    {variant === 'LOGIN' ? 'Entrar' : 'Criar conta'}
                </Button>
            </div>
        </form>
                
        <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">
                            Ou continue com
                        </span>
                    </div>
                </div>
                <div className="mt-6 flex gap-2">
                    <AuthSocialButton icon={BsGithub} onClick={() => socialAction('github')} />
                    <AuthSocialButton icon={BsGoogle} onClick={() => socialAction('google')} />
                </div>
        </div>
        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
            <div>
                {variant === 'LOGIN' ? 'Novo no Message App?' : 'Já tem uma conta?'}
            </div>
            <div onClick={toggleVariant} className="underline cursor-pointer">
                {variant === 'LOGIN' ? 'Criar conta' : 'Entrar'}
            </div>
        </div>
        </div>
    </div>
  )
}
