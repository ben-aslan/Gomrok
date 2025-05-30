import { useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";
import './style.css'
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Pencil, Trash2 } from "lucide-react";
import { getCookie } from "@/lib/utils/cookie.helper";
import { generateCsrfToken } from "@/lib/utils/csrf.helper";
import { getPanel } from "@/actions/panel.action";
import { DeleteProduct } from "../deleteProduct/deleteProduct";
import { EditProduct } from "../editProduct/editProduct";

type Product = {
    id: string
    name: string
    panel: string
}

export const ProductItem: FC<Product> = ({ id, name, panel }: Product) => {
    const t = useTranslations('i18n');

    const [panelName, setPanelName] = useState('')
    const [isEditVisable, setEditVisablity] = useState(false)
    const [isDeleteVisable, setDeleteVisablity] = useState(false)

    useEffect(() => {
        (async () => {
            const panelDetail = JSON.parse(await getPanel({ id: panel, csrf: generateCsrfToken(getCookie('csrf') ?? '') }))

            setPanelName(panelDetail.name)
        })()
    }, [])

    return (panelName != '') && (
        <div className='section'>
            <div>
                <div className='flex' key={id}>
                    <div>
                        <p>{name}</p>
                        <span className="url">panel: {panelName}</span>
                    </div>
                    <Menu as="div" className="relative ml-auto inline-block text-left">
                        <div>
                            <MenuButton className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                                    <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                                </svg>
                            </MenuButton>
                        </div>

                        <MenuItems transition className="absolute right-0 z-10 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600">
                            <div className="py-1">
                                <MenuItem>
                                    <a onClick={() => { setEditVisablity(true) }} href="#" className="flex px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                        <Pencil size={16} />&ensp;{t('edit')}
                                    </a>
                                </MenuItem>
                                <MenuItem>
                                    <a onClick={() => { setDeleteVisablity(true) }} href="#" className="flex px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                        <Trash2 size={16} />&ensp;{t('delete')}
                                    </a>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </Menu>
                    <br />
                </div>
                {isEditVisable && (<EditProduct visableState={[isEditVisable, setEditVisablity]} id={id} />)}
                <DeleteProduct id={id} name={name} visableState={[isDeleteVisable, setDeleteVisablity]} />
            </div>
        </div>
    )
}